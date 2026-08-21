import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import sessionHandler from '../api/admin/session.js'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    handleUpload: vi.fn(),
  },
}))

vi.mock('@vercel/blob/client', () => ({
  handleUpload: mocks.handleUpload,
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

async function adminHeaders(origin?: string) {
  const res = mockRes()
  await sessionHandler(
    { method: 'POST', body: { password: 'correct horse battery staple' } } as any,
    res as any,
  )
  const csrfToken = res.json.mock.calls[0][0].csrfToken as string
  const cookieCall = res.setHeader.mock.calls.find((c) => c[0] === 'Set-Cookie')
  const cookie = (cookieCall ? cookieCall[1] : '') as string
  // The blob client cannot send custom CSRF headers, so the route authenticates
  // with the session cookie plus an Origin/Referer same-host check instead.
  return {
    cookie,
    ...(origin !== undefined ? { origin } : {}),
    host: PROD_HOST,
  }
}

beforeEach(async () => {
  mocks.handleUpload.mockReset()
  vi.resetModules()
  vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple')
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a long test session secret that is never deployed')
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
    expect(mocks.handleUpload).not.toHaveBeenCalled()
  })

  it('POST without admin cookie: token generation rejected with Unauthorized', async () => {
    let capturedConfig: any
    mocks.handleUpload.mockImplementation(async (config: any) => {
      capturedConfig = config
      return await config.onBeforeGenerateToken('uploads/photo.jpg')
    })
    const res = mockRes()
    await handler({ method: 'POST', headers: { host: PROD_HOST }, body: {} } as any, res as any)

    expect(mocks.handleUpload).toHaveBeenCalledTimes(1)
    await expect(capturedConfig.onBeforeGenerateToken('uploads/photo.jpg')).rejects.toThrow(
      'Unauthorized',
    )
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('valid session cookie + same-origin POST: token request succeeds with image-only types', async () => {
    let capturedConfig: any
    mocks.handleUpload.mockImplementation(async (config: any) => {
      capturedConfig = config
      return await config.onBeforeGenerateToken('cms/photo.webp')
    })
    const headers = await adminHeaders(`https://${PROD_HOST}`)
    const res = mockRes()
    await handler({ method: 'POST', headers, body: {} } as any, res as any)

    expect(capturedConfig).toBeTruthy()
    await expect(capturedConfig.onBeforeGenerateToken('cms/photo.webp')).resolves.toEqual(
      expect.objectContaining({
        allowedContentTypes: expect.arrayContaining(['image/jpeg', 'image/png', 'image/webp']),
        maximumSizeInBytes: 20 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    )
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('valid session cookie but cross-origin POST: rejected with Unauthorized', async () => {
    let capturedConfig: any
    mocks.handleUpload.mockImplementation(async (config: any) => {
      capturedConfig = config
      return await config.onBeforeGenerateToken('cms/photo.jpg')
    })
    const headers = await adminHeaders('https://evil.example')
    const res = mockRes()
    await handler({ method: 'POST', headers, body: {} } as any, res as any)

    await expect(capturedConfig.onBeforeGenerateToken('cms/photo.jpg')).rejects.toThrow(
      'Unauthorized',
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('no Origin and no Referer: rejected with Unauthorized (cannot prove same-origin)', async () => {
    let capturedConfig: any
    mocks.handleUpload.mockImplementation(async (config: any) => {
      capturedConfig = config
      return await config.onBeforeGenerateToken('cms/photo.jpg')
    })
    const res = mockRes()
    await handler(
      { method: 'POST', headers: await adminHeaders(undefined), body: {} } as any,
      res as any,
    )

    await expect(capturedConfig.onBeforeGenerateToken('cms/photo.jpg')).rejects.toThrow(
      'Unauthorized',
    )
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('handleUpload generic failure maps to 400 with the error message', async () => {
    mocks.handleUpload.mockRejectedValue(new Error('boom'))
    const headers = await adminHeaders(`https://${PROD_HOST}`)
    const res = mockRes()
    await handler({ method: 'POST', headers, body: {} } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'boom' })
  })
})
