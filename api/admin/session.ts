import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie, createAdminSession, createSessionCookie, hasValidAdminSessionCookie } from '../../src/lib/adminAuth.js'
import { checkAdminLoginRateLimit, resetAdminLoginRateLimit } from '../../src/lib/storage.js'

function getClientIp(req: VercelRequest): string {
  const headers = req.headers ?? {}
  const raw = headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown'
  return (Array.isArray(raw) ? raw[0] : String(raw)).trim()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')

  if (req.method === 'GET') {
    // Session validity probe for the admin UI: lets a restored tab detect a
    // dead HttpOnly cookie BEFORE showing the editor (which cannot save).
    const ok = hasValidAdminSessionCookie(req.headers.cookie)
    return res.status(ok ? 200 : 401).json({ ok })
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', clearSessionCookie(process.env.NODE_ENV === 'production'))
    return res.status(200).json({ ok: true })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = getClientIp(req)
  let rate = { allowed: true, retryAfter: 0 }
  try {
    rate = await checkAdminLoginRateLimit(ip)
  } catch (err) {
    console.warn('[admin-auth] login rate limit unavailable:', err instanceof Error ? err.message : err)
  }
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfter))
    return res.status(429).json({ error: 'Слишком много попыток входа. Попробуйте позже.' })
  }

  const session = createAdminSession(req.body?.password)
  if (!session) {
    console.warn(`[admin-auth] failed login attempt from ${ip}`)
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    await resetAdminLoginRateLimit(ip)
  } catch (err) {
    console.warn('[admin-auth] failed to reset login rate limit:', err instanceof Error ? err.message : err)
  }
  res.setHeader('Set-Cookie', createSessionCookie(session.token, process.env.NODE_ENV === 'production'))
  return res.status(200).json({ csrfToken: session.csrfToken })
}
