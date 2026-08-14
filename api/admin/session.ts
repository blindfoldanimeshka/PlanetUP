import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie, createAdminSession, createSessionCookie } from '../../src/lib/adminAuth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearSessionCookie(process.env.NODE_ENV === 'production'))
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = createAdminSession(req.body?.password)
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  res.setHeader('Set-Cookie', createSessionCookie(session.token, process.env.NODE_ENV === 'production'))
  return res.status(200).json({ csrfToken: session.csrfToken })
}
