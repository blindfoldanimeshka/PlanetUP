import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getContent, setContent } from '../src/lib/storage.js'
import { hasValidAdminSession } from '../src/lib/adminAuth.js'
import { cmsDataSchema, MAX_BODY_SIZE } from '../src/lib/cmsSchema.js'

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

      const contentLength = req.headers['content-length']
      if (contentLength && Number(contentLength) > MAX_BODY_SIZE) {
        return res.status(413).json({ error: 'Request too large' })
      }

      const parsed = cmsDataSchema.safeParse(req.body)
      if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid content data' })
      }

      await setContent(parsed.data)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Content API error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
