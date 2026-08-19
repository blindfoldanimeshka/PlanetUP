import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../src/lib/storage.js', () => ({
  checkAdminLoginRateLimit: vi.fn(async () => ({ allowed: true, retryAfter: 0 })),
  resetAdminLoginRateLimit: vi.fn(async () => {}),
}))

type Handler = typeof import('../api/admin/session.js').default
let handler: Handler

function mockRes() {
  const json = vi.fn()
  const setHeader = vi.fn()
  const status = vi.fn(() => ({ json, setHeader }))
  return { status, json, setHeader }
}

beforeEach(async () => {
  vi.resetModules()
  vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple')
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a long test session secret that is never deployed')
  handler = (await import('../api/admin/session.js')).default
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('admin session API', () => {
  it('creates an HttpOnly session and returns a CSRF token for a valid password', async () => {
    const res = mockRes()
    await handler({ method: 'POST', body: { password: 'correct horse battery staple' } } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ csrfToken: expect.any(String) }))
    expect(res.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.stringContaining('HttpOnly'),
    )
  })

  it('rejects an invalid password without setting a session', async () => {
    const res = mockRes()
    await handler({ method: 'POST', body: { password: 'wrong password' } } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'private, no-store, max-age=0')
    const setCookieCalls = res.setHeader.mock.calls.filter((c) => c[0] === 'Set-Cookie')
    expect(setCookieCalls).toHaveLength(0)
  })

  it('clears the session cookie on logout', async () => {
    const res = mockRes()
    await handler({ method: 'DELETE' } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.setHeader).toHaveBeenCalledWith('Set-Cookie', expect.stringContaining('Max-Age=0'))
  })
})
