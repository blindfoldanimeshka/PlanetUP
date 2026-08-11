/**
 * Seed script — migrates static content.ts into Redis.
 * Run once: npx tsx scripts/seed-redis.ts (or node after build).
 *
 * Safe to re-run: overwrites the cms:content key with current content.ts data.
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Minimal .env.local loader
function loadEnv() {
  try {
    const text = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf-8')
    for (const line of text.split('\n')) {
      const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/)
      if (match) process.env[match[1]] = match[2].trim()
    }
  } catch {
    // ignore
  }
}
loadEnv()

async function main() {
  const { setContent, addAdminChatId } = await import('../src/lib/storage.ts')
  const { siteContent } = await import('../src/data/content.ts')

  await setContent(siteContent)
  console.log('✅ Content seeded to Redis')

  const adminChat = Number(process.env.TELEGRAM_CHAT_ID)
  if (adminChat) {
    await addAdminChatId(adminChat)
    console.log(`✅ Admin chat ${adminChat} registered`)
  } else {
    console.log('⚠️  TELEGRAM_CHAT_ID not set — skip admin registration')
  }
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
