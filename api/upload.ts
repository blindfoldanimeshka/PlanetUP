import type { VercelRequest, VercelResponse } from '@vercel/node'
import { randomBytes } from 'node:crypto'
import { put } from '@vercel/blob'
import { hasValidAdminSession } from '../src/lib/adminAuth.js'

/**
 * Direct photo upload for the admin panel.
 *
 * The compressed image bytes are POSTed here (same-origin fetch with the
 * admin session cookie + CSRF header), and the function stores them in
 * Vercel Blob server-side. We deliberately do NOT use @vercel/blob/client:
 * its gateway round-trip through vercel.com breaks under our strict CSP and
 * is not CORS-open to arbitrary deployment domains. Client-side compression
 * keeps bodies far below the 4.5 MB serverless limit.
 */

const IMAGE_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}
/** Compressed photos are well under this; it is an abuse ceiling. */
const MAX_BODY_BYTES = 4 * 1024 * 1024

function firstHeader(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0')

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentType = firstHeader(req.headers['content-type']) ?? ''
  if (!IMAGE_CONTENT_TYPES.has(contentType)) {
    return res.status(415).json({ error: 'Поддерживаются только JPG, PNG и WebP' })
  }

  const cookie = firstHeader(req.headers.cookie)
  const csrfToken = firstHeader(req.headers['x-csrf-token'])
  if (!hasValidAdminSession(cookie, csrfToken)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const raw = req.body
  const body = Buffer.isBuffer(raw)
    ? raw
    : typeof raw === 'string'
      ? Buffer.from(raw)
      : null
  if (!body || body.length === 0) {
    return res.status(400).json({ error: 'Некорректное тело запроса' })
  }
  if (body.length > MAX_BODY_BYTES) {
    return res.status(413).json({ error: 'Файл слишком большой' })
  }

  try {
    const ext = EXT_BY_TYPE[contentType]
    const pathname = `cms/${Date.now().toString(36)}${randomBytes(4).toString('hex')}.${ext}`
    const blob = await put(pathname, body as Buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType,
    })
    return res.status(200).json({ url: blob.url, pathname: blob.pathname })
  } catch (err) {
    console.error('[upload] failed:', err instanceof Error ? err.message : err)
    return res.status(502).json({ error: 'Не удалось сохранить файл' })
  }
}
