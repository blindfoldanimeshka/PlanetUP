import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

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

const rateLimitMap = new Map<string, number>()

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  const ipStr = Array.isArray(ip) ? ip[0] : ip

  // Honeypot check
  if (req.body.honeypot) {
    return res.status(400).json({ error: 'Spam detected' })
  }

  // Rate limit: max 1 per minute per IP
  const now = Date.now()
  const last = rateLimitMap.get(ipStr)
  if (last && now - last < 60000) {
    return res.status(429).json({
      error: 'Слишком много заявок. Подождите минуту.',
    })
  }
  rateLimitMap.set(ipStr, now)

  // Validate body
  const parseResult = schema.safeParse(req.body)
  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Некорректные данные',
      details: parseResult.error.flatten(),
    })
  }

  const data = parseResult.data

  // Telegram notification
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (botToken && chatId) {
    const text = [
      '<b>Новая заявка на пробное занятие</b>',
      '',
      `<b>Имя:</b> ${data.name}`,
      `<b>Телефон:</b> ${data.phone}`,
      `<b>Направление:</b> ${data.direction || 'Не указано'}`,
      `<b>Время:</b> ${data.preferredTime}`,
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
      console.error('Telegram send failed:', err)
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
            `<p><b>Имя:</b> ${data.name}</p>`,
            `<p><b>Телефон:</b> ${data.phone}</p>`,
            `<p><b>Направление:</b> ${data.direction || 'Не указано'}</p>`,
            `<p><b>Время:</b> ${data.preferredTime}</p>`,
          ].join(''),
        }),
      })
    } catch (err) {
      console.error('Resend email failed:', err)
    }
  }

  return res.status(200).json({ success: true })
}
