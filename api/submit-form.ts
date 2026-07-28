import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { escapeHtml } from '../src/lib/escapeHtml.js'

const schema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  phone: z.string().refine(
    (val) => {
      const digits = val.replace(/\D/g, '')
      return digits.length === 11 && digits.startsWith('7')
    },
    { message: 'Некорректный телефон' }
  ),
  direction: z.string().optional(),
  preferredTime: z.string().min(1, 'Время обязательно'),
  consent: z.boolean().refine(
    (v) => v === true,
    { message: 'Согласие обязательно' }
  ),
  honeypot: z.string().optional(),
})

/* ------------------------------------------------------------------ */
/*  Rate limiting — in-memory Map (resets on cold start).             */
/*  TODO: Replace with Vercel KV / Upstash Redis for production.      */
/* ------------------------------------------------------------------ */
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const CLEANUP_INTERVAL = 300000 // 5 minutes

function cleanupOldEntries() {
  const now = Date.now()
  for (const [ip, last] of rateLimitMap.entries()) {
    if (now - last > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(ip)
    }
  }
}

setInterval(cleanupOldEntries, CLEANUP_INTERVAL)

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const ipStr = Array.isArray(rawIp) ? rawIp[0].trim() : rawIp.trim()

  // Honeypot check — return 200 OK to avoid revealing detection
  if (req.body.honeypot) {
    return res.status(200).json({ success: true })
  }

  // Rate limit: max 1 per minute per IP
  const now = Date.now()
  const last = rateLimitMap.get(ipStr)
  if (last && now - last < RATE_LIMIT_WINDOW) {
    return res.status(429).json({
      error: 'Слишком много заявок. Подождите минуту.',
    })
  }
  rateLimitMap.set(ipStr, now)

  // Validate body
  const parseResult = schema.safeParse(req.body)
  if (!parseResult.success) {
    const isDev = process.env.NODE_ENV === 'development'
    return res.status(400).json({
      error: 'Некорректные данные',
      ...(isDev && { details: parseResult.error.flatten() }),
    })
  }

  const data = parseResult.data

  // Escape user data for HTML output
  const safeName = escapeHtml(data.name)
  const safePhone = escapeHtml(data.phone)
  const safeDirection = escapeHtml(data.direction || 'Не указано')
  const safeTime = escapeHtml(data.preferredTime)

  // Telegram notification
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (botToken && chatId) {
    const text = [
      '<b>Новая заявка на пробное занятие</b>',
      '',
      `<b>Имя:</b> ${safeName}`,
      `<b>Телефон:</b> ${safePhone}`,
      `<b>Направление:</b> ${safeDirection}`,
      `<b>Время:</b> ${safeTime}`,
    ].join('\n')

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
      })
    } catch (err) {
      console.error('Telegram send failed:', err instanceof Error ? err.message : err)
    }
  }

  // Resend email copy
  const resendKey = process.env.RESEND_API_KEY
  const emailTo = process.env.NOTIFICATION_EMAIL
  if (resendKey && emailTo) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'hello@planetaup.ru',
          to: emailTo,
          subject: 'Новая заявка на пробное занятие — Планета UP',
          html: [
            '<h2>Новая заявка</h2>',
            `<p><b>Имя:</b> ${safeName}</p>`,
            `<p><b>Телефон:</b> ${safePhone}</p>`,
            `<p><b>Направление:</b> ${safeDirection}</p>`,
            `<p><b>Время:</b> ${safeTime}</p>`,
          ].join(''),
        }),
      })
    } catch (err) {
      console.error('Resend email failed:', err instanceof Error ? err.message : err)
    }
  }

  return res.status(200).json({ success: true })
}
