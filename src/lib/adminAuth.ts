import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const SESSION_COOKIE = 'planetup_admin_session'
const SESSION_TTL_SECONDS = 2 * 60 * 60

interface AdminSession {
  csrfToken: string
  expiresAt: number
}

function getRequiredEnv(name: 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET'): string | null {
  const value = process.env[name]
  return value && value.length >= 16 ? value : null
}

function equalSecrets(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function parseCookie(cookieHeader: string | undefined, name: string): string | null {
  if (!cookieHeader) return null
  const value = cookieHeader.split(';').find((part) => part.trim().startsWith(`${name}=`))
  return value ? value.trim().slice(name.length + 1) : null
}

export function createAdminSession(password: unknown): { token: string; csrfToken: string } | null {
  const expectedPassword = getRequiredEnv('ADMIN_PASSWORD')
  const secret = getRequiredEnv('ADMIN_SESSION_SECRET')
  if (!expectedPassword || !secret || typeof password !== 'string' || !equalSecrets(password, expectedPassword)) {
    return null
  }

  const session: AdminSession = {
    csrfToken: randomBytes(32).toString('base64url'),
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  }
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  return { token: `${payload}.${sign(payload, secret)}`, csrfToken: session.csrfToken }
}

export function createSessionCookie(token: string, isProduction: boolean): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/api',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    ...(isProduction ? ['Secure'] : []),
  ].join('; ')
}

export function clearSessionCookie(isProduction: boolean): string {
  return [
    `${SESSION_COOKIE}=`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/api',
    'Max-Age=0',
    ...(isProduction ? ['Secure'] : []),
  ].join('; ')
}

function verifySessionToken(token: string | null): AdminSession | null {
  const secret = getRequiredEnv('ADMIN_SESSION_SECRET')
  if (!secret || !token) return null

  const [payload, signature] = token.split('.')
  if (!payload || !signature || !equalSecrets(signature, sign(payload, secret))) return null

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession
    return session.expiresAt > Date.now() ? session : null
  } catch {
    return null
  }
}

export function hasValidAdminSession(cookieHeader: string | undefined, csrfToken: unknown): boolean {
  const token = parseCookie(cookieHeader, SESSION_COOKIE)
  if (!token || typeof csrfToken !== 'string') return false
  const session = verifySessionToken(token)
  return session !== null && equalSecrets(csrfToken, session.csrfToken)
}

/**
 * Cookie-only session validation for endpoints that cannot receive custom
 * headers from their client (e.g. @vercel/blob client uploads, whose internal
 * token request never carries our x-csrf-token header). Must be paired with a
 * same-origin Origin/Referer check to retain CSRF defense.
 */
export function hasValidAdminSessionCookie(cookieHeader: string | undefined): boolean {
  return verifySessionToken(parseCookie(cookieHeader, SESSION_COOKIE)) !== null
}
