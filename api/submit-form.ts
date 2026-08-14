import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  bookingSchema,
  formatPhone,
  type BookingFormData,
} from '../src/lib/validation.js'
import { escapeHtml } from '../src/lib/escapeHtml.js'
import { addSubmission, claimSubmissionRateLimit } from '../src/lib/storage.js'

/* ------------------------------------------------------------------ */
/*  Rate limiting — shared Upstash Redis (atomic SET NX EX).          */
/*  Survives cold starts and scales across serverless instances.      */
/* ------------------------------------------------------------------ */
const sourceLabels: Record<string, string> = {
  vk: 'ВКонтакте',
  instagram: 'Instagram',
  telegram: 'Telegram',
  friends: 'От друзей/знакомых',
  search: 'Поиск в интернете',
  advert: 'Реклама',
  other: 'Другое',
}

function formatPhoneE164(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `+${digits}`
}

/* ------------------------------------------------------------------ */
/*  Telegram-safe HTML escaping                                       */
/*  Only these tags are allowed in parse_mode='HTML':                 */
/*  b, strong, i, em, u, ins, s, strike, del, span, a                */
/* ------------------------------------------------------------------ */
function escapeTelegramHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatTelegramMessage(data: BookingFormData): string {
  const common = [
    `<b>Телефон:</b> <a href="tel:${formatPhoneE164(data.phone)}">${escapeTelegramHtml(formatPhone(data.phone.replace(/\D/g, '')))}</a>`,
    `<b>Откуда узнали:</b> ${escapeTelegramHtml(sourceLabels[data.source] ?? data.source)}`,
  ]

  if (data.formType === 'child') {
    return [
      '<b>Новая заявка — ребёнок</b>',
      '',
      `<b>Имя ребёнка:</b> ${escapeTelegramHtml(data.childName)}`,
      `<b>Возраст:</b> ${escapeTelegramHtml(data.age)}`,
      `<b>Был ли опыт:</b> ${data.hasExperience === 'yes' ? 'Да' : 'Нет'}`,
      ...(data.hasExperience === 'yes' && data.experienceDetails
        ? [`<b>Опыт:</b> ${escapeTelegramHtml(data.experienceDetails)}`]
        : []),
      ...common,
      `<b>Имя родителя:</b> ${escapeTelegramHtml(data.parentName)}`,
    ].join('\n')
  }

  return [
    '<b>Новая заявка — взрослый</b>',
    '',
    `<b>Имя:</b> ${escapeTelegramHtml(data.name)}`,
    `<b>Возраст:</b> ${escapeTelegramHtml(data.age)}`,
    ...(data.previousSportExperience
      ? [`<b>Спортивный опыт:</b> ${escapeTelegramHtml(data.previousSportExperience)}`]
      : []),
    ...(data.injuries
      ? [`<b>Травмы / ограничения:</b> ${escapeTelegramHtml(data.injuries)}`]
      : []),
    ...common,
  ].join('\n')
}

function formatPlainTextFallback(data: BookingFormData): string {
  const common = [
    `Телефон: ${formatPhone(data.phone.replace(/\D/g, ''))}`,
    `Откуда узнали: ${sourceLabels[data.source] ?? data.source}`,
  ]

  if (data.formType === 'child') {
    return [
      'Новая заявка — ребёнок',
      '',
      `Имя ребёнка: ${data.childName}`,
      `Возраст: ${data.age}`,
      `Был ли опыт: ${data.hasExperience === 'yes' ? 'Да' : 'Нет'}`,
      ...(data.hasExperience === 'yes' && data.experienceDetails
        ? [`Опыт: ${data.experienceDetails}`]
        : []),
      ...common,
      `Имя родителя: ${data.parentName}`,
    ].join('\n')
  }

  return [
    'Новая заявка — взрослый',
    '',
    `Имя: ${data.name}`,
    `Возраст: ${data.age}`,
    ...(data.previousSportExperience
      ? [`Спортивный опыт: ${data.previousSportExperience}`]
      : []),
    ...(data.injuries ? [`Травмы / ограничения: ${data.injuries}`] : []),
    ...common,
  ].join('\n')
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sendTelegramNotification(
  botToken: string,
  chatId: string,
  data: BookingFormData
): Promise<void> {
  if (!/^\d+:[A-Za-z0-9_-]{35}$/.test(botToken)) {
    throw new Error('Invalid TELEGRAM_BOT_TOKEN format')
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const htmlText = formatTelegramMessage(data)

  const payload = {
    chat_id: chatId,
    text: htmlText,
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  }

  const lastError = await trySend(url, payload)
  if (lastError) {
    // Fallback to plain text — often HTML parse errors come from unexpected input.
    const fallbackPayload = {
      chat_id: chatId,
      text: formatPlainTextFallback(data),
      disable_web_page_preview: true,
    }
    const fallbackError = await trySend(url, fallbackPayload)
    if (fallbackError) {
      throw new Error(
        `Telegram send failed (HTML and plain text): ${fallbackError.message}`
      )
    }
  }
}

async function trySend(
  url: string,
  payload: Record<string, unknown>
): Promise<Error | null> {
  const maxAttempts = 3
  let lastError: Error | null = null

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const bodyText = await res.text()
      let body: Record<string, unknown> | null = null
      try {
        body = JSON.parse(bodyText)
      } catch {
        // Non-JSON response
      }

      if (!res.ok) {
        const description = body?.description ?? bodyText
        throw new Error(`HTTP ${res.status}: ${description}`)
      }

      if (body && body.ok === false) {
        const description = String(body.description ?? 'Unknown Telegram error')
        throw new Error(`Telegram API error: ${description}`)
      }

      return null
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < maxAttempts) {
        await sleep(500 * attempt)
      }
    }
  }

  return lastError
}

function formatEmailHtml(data: BookingFormData): string {
  const rows: string[] = []

  if (data.formType === 'child') {
    rows.push(
      row('Тип заявки', 'Ребёнок'),
      row('Имя ребёнка', data.childName),
      row('Возраст', data.age),
      row('Был ли опыт', data.hasExperience === 'yes' ? 'Да' : 'Нет'),
      ...(data.hasExperience === 'yes' && data.experienceDetails
        ? [row('Опыт', data.experienceDetails)]
        : []),
      row('Телефон', formatPhone(data.phone.replace(/\D/g, ''))),
      row('Имя родителя', data.parentName),
      row('Откуда узнали', sourceLabels[data.source] ?? data.source)
    )
  } else {
    rows.push(
      row('Тип заявки', 'Взрослый'),
      row('Имя', data.name),
      row('Возраст', data.age),
      ...(data.previousSportExperience
        ? [row('Спортивный опыт', data.previousSportExperience)]
        : []),
      ...(data.injuries ? [row('Травмы / ограничения', data.injuries)] : []),
      row('Телефон', formatPhone(data.phone.replace(/\D/g, ''))),
      row('Откуда узнали', sourceLabels[data.source] ?? data.source)
    )
  }

  return [
    '<h2>Новая заявка на пробное занятие — Планета UP</h2>',
    '<table>',
    ...rows,
    '</table>',
  ].join('')
}

function row(label: string, value: string): string {
  return `<tr><td><b>${escapeHtml(label)}</b></td><td>${escapeHtml(value)}</td></tr>`
}

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
  let allowed: boolean
  try {
    allowed = await claimSubmissionRateLimit(ipStr)
  } catch (err) {
    console.error('Booking rate limit unavailable:', err instanceof Error ? err.message : err)
    return res.status(503).json({ error: 'Service temporarily unavailable' })
  }
  if (!allowed) {
    return res.status(429).json({
      error: 'Слишком много заявок. Подождите минуту.',
    })
  }
  // Validate body
  const parseResult = bookingSchema.safeParse(req.body)
  if (!parseResult.success) {
    const isDev = process.env.NODE_ENV === 'development'
    return res.status(400).json({
      error: 'Некорректные данные',
      ...(isDev && { details: parseResult.error.flatten() }),
    })
  }

  const data = parseResult.data

  // Telegram notification
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (botToken && chatId) {
    try {
      await sendTelegramNotification(botToken, chatId, data)
    } catch (err) {
      console.error(
        'Telegram notification failed:',
        err instanceof Error ? err.message : err
      )
    }
  } else {
    console.warn('Telegram credentials not configured; skipping notification')
  }

  // Resend email copy
  const resendKey = process.env.RESEND_API_KEY
  const emailTo = process.env.NOTIFICATION_EMAIL
  if (resendKey && emailTo) {
    try {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: 'hello@planetaup.ru',
          to: emailTo,
          subject: 'Новая заявка на пробное занятие — Планета UP',
          html: formatEmailHtml(data),
        }),
      })
      if (!resendRes.ok) {
        const text = await resendRes.text().catch(() => '')
        console.error('Resend email failed:', resendRes.status, text)
      }
    } catch (err) {
      console.error(
        'Resend email failed:',
        err instanceof Error ? err.message : err
      )
    }
  }

  // Persist submission for the admin panel (non-fatal if storage fails)
  try {
    await addSubmission(data as unknown as Record<string, unknown>)
  } catch (err) {
    console.error('Failed to persist submission:', err instanceof Error ? err.message : err)
  }

  return res.status(200).json({ success: true })
}
