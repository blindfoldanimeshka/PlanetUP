import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getContent } from '../src/lib/storage.js'

/**
 * Public API — returns the full CMS content from Redis.
 * Frontend fetches this on load so admin edits via Telegram are reflected live.
 */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const content = await getContent()
    if (!content) {
      return res.status(404).json({ error: 'Content not found' })
    }
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
    return res.status(200).json(content)
  } catch (err) {
    console.error('Failed to read content:', err)
    return res.status(500).json({ error: 'Failed to load content' })
  }
}
