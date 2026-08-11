// Manual E2E test for Telegram bot integration.
// Reads credentials from .env.local and sends a test message to the admin chat.
//
// Usage: node scripts/telegram-test.mjs

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv(path) {
  try {
    const text = readFileSync(path, 'utf-8')
    for (const line of text.split('\n')) {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
      if (match) {
        process.env[match[1]] = match[2].trim()
      }
    }
  } catch {
    // ignore
  }
}

loadEnv(resolve(process.cwd(), '.env.local'))

const token = process.env.TELEGRAM_BOT_TOKEN
const chatId = process.env.TELEGRAM_CHAT_ID

if (!token || !chatId) {
  console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.local')
  process.exit(1)
}

async function sendTest() {
  console.log('Bot token:', token.slice(0, 15) + '...')
  console.log('Chat ID:', chatId)

  // 1. Verify token with getMe
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`)
  const meBody = await meRes.json()
  console.log('\ngetMe response:', JSON.stringify(meBody, null, 2))

  if (!meBody.ok) {
    console.error('Token validation failed')
    process.exit(1)
  }

  // 2. Send test message
  const messageRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '🧪 PlanetUP test: бот работает и получает сообщения из формы.',
      parse_mode: 'HTML',
    }),
  })
  const messageBody = await messageRes.json()
  console.log('\nsendMessage response:', JSON.stringify(messageBody, null, 2))

  if (!messageBody.ok) {
    console.error('Message delivery failed')
    process.exit(1)
  }

  console.log('\n✅ Telegram E2E test passed')
}

sendTest().catch((err) => {
  console.error('Test failed:', err.message)
  process.exit(1)
})
