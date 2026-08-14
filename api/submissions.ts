import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getSubmissions, deleteSubmission, updateSubmissionStatus } from '../src/lib/storage.js'
import { hasValidAdminSession } from '../src/lib/adminAuth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!hasValidAdminSession(req.headers.cookie, req.headers['x-csrf-token'])) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (req.method === 'GET') {
      const items = await getSubmissions()
      return res.status(200).json(items)
    }

    if (req.method === 'PATCH') {
      const id = req.query.id
      if (typeof id !== 'string' || !id) {
        return res.status(400).json({ error: 'id required' })
      }
      const body = req.body as { status?: string }
      if (body.status !== 'new' && body.status !== 'processed') {
        return res.status(400).json({ error: 'invalid status' })
      }
      await updateSubmissionStatus(id, body.status)
      return res.status(200).json({ ok: true })
    }

    if (req.method === 'DELETE') {
      const id = req.query.id
      if (typeof id !== 'string' || !id) {
        return res.status(400).json({ error: 'id required' })
      }
      await deleteSubmission(id)
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('Submissions API error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
