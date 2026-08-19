import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { CmsData } from '../src/types/cms'
import sessionHandler from '../api/admin/session.js'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getContent: vi.fn(),
    setContent: vi.fn(),
  },
}))

vi.mock('../src/lib/storage.js', () => ({
  getContent: mocks.getContent,
  setContent: mocks.setContent,
  checkAdminLoginRateLimit: vi.fn(async () => ({ allowed: true, retryAfter: 0 })),
  resetAdminLoginRateLimit: vi.fn(async () => {}),
}))

type Handler = typeof import('../api/content.js').default
let handler: Handler

const fixture: CmsData = {
  trainers: [],
  subscriptions: [],
  groups: [],
  faq: [],
  testimonials: [],
  lifePosts: [],
  gallery: [],
  settings: {
    phone: '+7 (900) 000-00-00',
    phoneHref: 'tel:+79000000000',
    address: 'Долгопрудный',
    email: 'a@b.ru',
    social: { vk: 'vk.com/x', telegram: 't.me/x', whatsapp: 'wa.me/x' },
    hero: { title: 'T', subtitle: 'S' },
    seo: { title: 'T', description: 'D' },
  },
}

function mockRes() {
  const json = vi.fn()
  const status = vi.fn(() => ({ json, setHeader }))
  const setHeader = vi.fn()
  return { status, json, setHeader }
}

function mockReq(method: string, opts: { body?: unknown; token?: string } = {}) {
  return {
    method,
    headers: opts.token !== undefined ? { 'x-admin-token': opts.token } : {},
    body: opts.body,
  }
}

async function adminHeaders() {
  const res = mockRes()
  await sessionHandler({ method: 'POST', body: { password: 'correct horse battery staple' } } as any, res as any)
  const csrfToken = res.json.mock.calls[0][0].csrfToken as string
  const cookieCall = res.setHeader.mock.calls.find((c) => c[0] === 'Set-Cookie')
  const cookie = (cookieCall ? cookieCall[1] : '') as string
  return { cookie, 'x-csrf-token': csrfToken }
}

beforeEach(async () => {
  mocks.getContent.mockReset()
  mocks.setContent.mockReset()
  vi.resetModules()
  vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple')
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a long test session secret that is never deployed')
  handler = (await import('../api/content.js')).default
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('content API', () => {
  it('GET returns 200 with content and Cache-Control header', async () => {
    mocks.getContent.mockResolvedValue(fixture)
    const res = mockRes()
    await handler(mockReq('GET') as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(fixture)
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 's-maxage=10, stale-while-revalidate')
  })

  it('GET returns 404 when content not seeded', async () => {
    mocks.getContent.mockResolvedValue(null)
    const res = mockRes()
    await handler(mockReq('GET') as any, res as any)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({ error: 'Content not found' })
  })

  it('PUT with a valid session and CSRF token saves content and returns 200', async () => {
    mocks.setContent.mockResolvedValue(undefined)
    const res = mockRes()
    const headers = await adminHeaders()
    await handler({ method: 'PUT', body: fixture, headers } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
    expect(mocks.setContent).toHaveBeenCalledWith(fixture)
  })

  it('PUT with the legacy admin-token header returns 401 and does not save', async () => {
    const res = mockRes()
    await handler(mockReq('PUT', { body: fixture, token: 'test-admin-token' }) as any, res as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(mocks.setContent).not.toHaveBeenCalled()
  })

  it('PUT with missing token returns 401', async () => {
    const res = mockRes()
    await handler(mockReq('PUT', { body: fixture }) as any, res as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('PATCH returns 405 Method not allowed', async () => {
    const res = mockRes()
    await handler(mockReq('PATCH') as any, res as any)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('returns 500 when storage throws', async () => {
    mocks.getContent.mockRejectedValue(new Error('redis down'))
    const res = mockRes()
    await handler(mockReq('GET') as any, res as any)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal error' })
  })
})
