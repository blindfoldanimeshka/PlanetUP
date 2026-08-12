import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getContent, setContent } from '../src/lib/storage.js'
import type { CmsData } from '../src/types/cms.js'

/**
 * Admin write token. Must match the client gate password
 * (VITE_ADMIN_PASSWORD) so the admin UI can authenticate its saves.
 */
const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? 'changeme-admin-token'

/**
 * Public API — returns the full CMS content from Redis.
 * Frontend fetches this on load so admin edits via Telegram are reflected live.
 *
 * PUT — admin write. Requires `x-admin-token` header === ADMIN_TOKEN.
 * Body is the full CmsData blob; it is persisted via setContent().
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      const content = await getContent()
      if (!content) {
        return res.status(404).json({ error: 'Content not found' })
      }
      res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
      return res.status(200).json(content)
    }

    if (req.method === 'PUT') {
      const token = req.headers['x-admin-token']
      if (token !== ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      const data = req.body as CmsData
      await setContent(data)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Content API error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
