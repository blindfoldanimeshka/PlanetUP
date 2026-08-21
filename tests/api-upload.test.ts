import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import sessionHandler from '../api/admin/session.js'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    put: vi.fn(),
  },
}))

vi.mock('@vercel/blob', () => ({
  put: mocks.put,
}))

vi.mock('../src/lib/storage.js', () => ({
  checkAdminLoginRateLimit: vi.fn(async () => ({ allowed: true, retryAfter: 0 })),
  resetAdminLoginRateLimit: vi.fn(async () => {}),
}))

type Handler = typeof import('../api/upload.js').default
let handler: Handler

const PROD_HOST = 'planetaup.vercel.app'

function mockRes() {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  const setHeader = vi.fn()
  return { status, json, setHeader }
}

async function adminHeaders(extra: Record<string, string> = {}) {
  const res = mockRes()
  await sessionHandler(
    { method: 'POST', body: { password: 'correct horse battery staple' } } as any,
    res as any,
  )
  const csrfToken = res.json.mock.calls[0][0].csrfToken as string
  const cookieCall = res.setHeader.mock.calls.find((c) => c[0] === 'Set-Cookie')
  const cookie = (cookieCall ? cookieCall[1] : '') as string
  return {
    cookie,
    'x-csrf-token': csrfToken,
    host: PROD_HOST,
    ...extra,
  }
}

beforeEach(async () => {
  mocks.put.mockReset()
  vi.resetModules()
  vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple')
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a long test session secret that is never deployed')
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'vercel_blob_rw_store_test_token')
  handler = (await import('../api/upload.js')).default
  vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('upload API', () => {
  it('GET returns 405 Method not allowed', async () => {
    const res = mockRes()
    await handler({ method: 'GET', headers: {} } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    expect(mocks.put).not.toHaveBeenCalled()
  })

  it('POST without admin session returns 401 and never touches Blob', async () => {
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers: { host: PROD_HOST, 'content-type': 'application/json' },
        body: { data: 'eA==', type: 'image/webp' },
      } as any,
      res as any,
    )

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
    expect(mocks.put).not.toHaveBeenCalled()
  })

  it('valid session + CSRF: stores the photo under cms/ and returns the url', async () => {
    mocks.put.mockResolvedValue({
      url: 'https://store.public.blob.vercel-storage.com/cms/photo-abc.webp',
      pathname: 'cms/photo-abc.webp',
    })
    const headers = await adminHeaders({ 'content-type': 'application/json' })
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers,
        body: { data: Buffer.from('webp-bytes').toString('base64'), type: 'image/webp' },
      } as any,
      res as any,
    )

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://store.public.blob.vercel-storage.com/cms/photo-abc.webp',
      }),
    )
    expect(mocks.put).toHaveBeenCalledTimes(1)
    const [pathname, , opts] = mocks.put.mock.calls[0]
    expect(String(pathname)).toMatch(/^cms\/[a-z0-9][\w.-]*\.webp$/)
    expect(opts).toEqual(expect.objectContaining({ access: 'public', addRandomSuffix: true }))
  })

  it('rejects unsupported content types with 415', async () => {
    const headers = await adminHeaders({ 'content-type': 'application/json' })
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers,
        body: { data: Buffer.from('%PDF').toString('base64'), type: 'application/pdf' },
      } as any,
      res as any,
    )

    expect(res.status).toHaveBeenCalledWith(415)
    expect(mocks.put).not.toHaveBeenCalled()
  })

  it('rejects bodies above the 4 MB cap with 413', async () => {
    const headers = await adminHeaders({ 'content-type': 'application/json' })
    const bigBase64 = 'A'.repeat(6 * 1024 * 1024) // ~4.5 MB once decoded
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers,
        body: { data: bigBase64, type: 'image/jpeg' },
      } as any,
      res as any,
    )

    expect(res.status).toHaveBeenCalledWith(413)
    expect(mocks.put).not.toHaveBeenCalled()
  })

  it('maps Blob failures to 502 without leaking internals', async () => {
    mocks.put.mockRejectedValue(new Error('blob unavailable'))
    const headers = await adminHeaders({ 'content-type': 'application/json' })
    const res = mockRes()
    await handler(
      {
        method: 'POST',
        headers,
        body: { data: Buffer.from('png').toString('base64'), type: 'image/png' },
      } as any,
      res as any,
    )

    expect(res.status).toHaveBeenCalledWith(502)
    expect(res.json).toHaveBeenCalledWith({ error: 'Не удалось сохранить файл' })
  })
})
