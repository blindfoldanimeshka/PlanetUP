import type { VercelRequest, VercelResponse } from '@vercel/node'
import { timingSafeEqual } from 'node:crypto'

/**
 * Telegram Bot webhook handler.
 *
 * Flow:
 * 1. Telegram POSTs updates here (message, callback_query, photo, etc.)
 * 2. We route by update type → command handler or state handler
 * 3. Admin state (conversation context) lives in Redis so multi-step flows work
 *
 * Set webhook via:
 *   curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook \
 *     -H "Content-Type: application/json" \
 *     -d '{"url":"https://your-domain.vercel.app/api/tg/webhook"}'
 */

import {
  getAdminState,
  isAdmin,
} from '../../src/lib/storage.js'
import { handleCommand, handleCallback } from './bot.js'

const TELEGRAM_API = (token: string) => `https://api.telegram.org/bot${token}`

function matchesWebhookSecret(received: string | string[] | undefined, expected: string): boolean {
  const value = Array.isArray(received) ? received[0] : received
  if (!value) return false
  const left = Buffer.from(value)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

async function tgFetch(token: string, method: string, body: Record<string, unknown>) {
  const res = await fetch(TELEGRAM_API(token) + `/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json() as Promise<{ ok: boolean; result?: unknown; description?: string }>
}

export async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  extra?: Record<string, unknown>
) {
  return tgFetch(token, 'sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    ...extra,
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!webhookSecret || !matchesWebhookSecret(req.headers?.['x-telegram-bot-api-secret-token'], webhookSecret)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not set')
    return res.status(200).json({ ok: true }) // ack to avoid Telegram retries
  }

  const update = req.body as any

  try {
    // --- Message ---
    if (update.message) {
      const msg = update.message
      const chatId = msg.chat.id
      const text = msg.text?.trim()
      const photo = msg.photo

      // Authorization: only the configured admin chat (or registered admins)
      if (!(await isAdmin(chatId))) {
        await sendMessage(token, chatId, '⛔ Нет доступа. Обратитесь к администратору сайта.')
        return res.status(200).json({ ok: true })
      }

      // Photo upload — handle if we're expecting one
      if (photo && photo.length > 0) {
        const state = await getAdminState(chatId)
        if (state?.action === 'awaitingPhoto') {
          await handleCallback(token, chatId, { type: 'photo', photo }, state)
          return res.status(200).json({ ok: true })
        }
      }

      // Command (starts with /)
      if (text?.startsWith('/')) {
        await handleCommand(token, chatId, text)
        return res.status(200).json({ ok: true })
      }

      // Otherwise — feed to state machine (multi-step editing)
      const state = await getAdminState(chatId)
      if (state) {
        await handleCallback(token, chatId, { type: 'text', text }, state)
        return res.status(200).json({ ok: true })
      }

      // No state, no command — show help
      await sendMessage(
        token,
        chatId,
        'Напишите /start для показа меню или выберите раздел для редактирования.'
      )
      return res.status(200).json({ ok: true })
    }

    // --- Callback query (inline button press) ---
    if (update.callback_query) {
      const cq = update.callback_query
      const chatId = cq.message.chat.id
      const data = cq.data

      if (!(await isAdmin(chatId))) {
        return res.status(200).json({ ok: true })
      }

      const state = await getAdminState(chatId)
      await handleCallback(token, chatId, { type: 'callback', data }, state ?? undefined)

      // Acknowledge the callback (remove loading spinner)
      await tgFetch(token, 'answerCallbackQuery', { callback_query_id: cq.id })
      return res.status(200).json({ ok: true })
    }

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Telegram webhook error:', err)
    return res.status(200).json({ ok: true }) // always ack to avoid retries
  }
}
