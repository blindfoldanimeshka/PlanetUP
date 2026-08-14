import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getContent, setContent } from '../src/lib/storage.js'
import type { CmsData } from '../src/types/cms.js'
import { hasValidAdminSession } from '../src/lib/adminAuth.js'

/**
 * Public API — returns the full CMS content from Redis.
 * Frontend fetches this on load so admin edits via Telegram are reflected live.
 *
 * PUT — admin write. Requires a valid HttpOnly admin session cookie
 * (issued by POST /api/admin/session) plus a matching `x-csrf-token` header.
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
      if (!hasValidAdminSession(req.headers.cookie, req.headers['x-csrf-token'])) {
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
