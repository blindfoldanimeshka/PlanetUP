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

  /* Regression: production once had 13-char ADMIN_PASSWORD/ADMIN_SESSION_SECRET,
   * which made getRequiredEnv() return null and login fail for EVERYONE while
   * the panel still opened via stale sessionStorage. Locks the ≥16 contract. */
  it('rejects login when ADMIN_PASSWORD is shorter than 16 chars even if it matches', async () => {
    vi.stubEnv('ADMIN_PASSWORD', 'short13chars')
    const res = mockRes()
    await handler({ method: 'POST', body: { password: 'short13chars' } } as unknown as Parameters<typeof handler>[0], res as unknown as Parameters<typeof handler>[1])

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects login when ADMIN_SESSION_SECRET is shorter than 16 chars', async () => {
    vi.stubEnv('ADMIN_SESSION_SECRET', 'short13secret')
    const res = mockRes()
    await handler({ method: 'POST', body: { password: 'correct horse battery staple' } } as unknown as Parameters<typeof handler>[0], res as unknown as Parameters<typeof handler>[1])

    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('GET reports a live session for a valid cookie and 401 without one', async () => {
    const createRes = mockRes()
    await handler({ method: 'POST', body: { password: 'correct horse battery staple' } } as unknown as Parameters<typeof handler>[0], createRes as unknown as Parameters<typeof handler>[1])
    const setCookieCall = createRes.setHeader.mock.calls.find((c) => c[0] === 'Set-Cookie')
    const raw = setCookieCall?.[1] as string | undefined
    expect(raw).toBeTruthy()
    const token = (raw ?? '').split(';')[0].split('=').slice(1).join('=')

    const okRes = mockRes()
    await handler({ method: 'GET', headers: { cookie: `planetup_admin_session=${token}` } } as unknown as Parameters<typeof handler>[0], okRes as unknown as Parameters<typeof handler>[1])
    expect(okRes.status).toHaveBeenCalledWith(200)
    expect(okRes.json).toHaveBeenCalledWith({ ok: true })

    const badRes = mockRes()
    await handler({ method: 'GET', headers: {} } as unknown as Parameters<typeof handler>[0], badRes as unknown as Parameters<typeof handler>[1])
    expect(badRes.status).toHaveBeenCalledWith(401)
    expect(badRes.json).toHaveBeenCalledWith({ ok: false })
  })
})
