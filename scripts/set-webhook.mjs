/**
 * Set the Telegram webhook URL so Telegram sends updates to our Vercel function.
 *
 * Usage:
 *   node scripts/set-webhook.mjs          # uses TELEGRAM_BOT_TOKEN from .env.local, sets URL automatically
 *   node scripts/set-webhook.mjs https://your-domain.vercel.app   # custom URL
 *
 * The webhook points to /api/tg/webhook.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  try {
    const text = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8')
    for (const line of text.split('\n')) {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
      if (match && !process.env[match[1]]) {
        let val = match[2].trim().replace(/^["']|["']$/g, '').replace(/\r$/, '')
        process.env[match[1]] = val
      }
    }
  } catch {
    // ignore
  }
}
loadEnv()

const token = process.env.TELEGRAM_BOT_TOKEN
const argUrl = process.argv[2]

// Derive Vercel URL from env or use provided arg
const baseUrl = argUrl || process.env.VERCEL_URL || process.env.NEXT_PUBLIC_SITE_URL
if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN in .env.local')
  process.exit(1)
}
if (!baseUrl) {
  console.error('Provide a URL: node scripts/set-webhook.mjs https://your-domain.vercel.app')
  process.exit(1)
}

const webhookUrl = baseUrl.replace(/\/$/, '') + '/api/tg/webhook'

async function setWebhook() {
  const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true }),
  })
  const body = await res.json()
  console.log('setWebhook response:', JSON.stringify(body, null, 2))
  if (body.ok) {
    console.log(`\n✅ Webhook set to: ${webhookUrl}`)
  } else {
    console.error('❌ Failed to set webhook')
    process.exit(1)
  }
}

setWebhook().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
