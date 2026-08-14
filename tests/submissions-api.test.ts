import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import sessionHandler from '../api/admin/session.js'

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getSubmissions: vi.fn(),
    deleteSubmission: vi.fn(),
    updateSubmissionStatus: vi.fn(),
  },
}))

vi.mock('../src/lib/storage.js', () => ({
  getSubmissions: mocks.getSubmissions,
  deleteSubmission: mocks.deleteSubmission,
  updateSubmissionStatus: mocks.updateSubmissionStatus,
}))

type Handler = typeof import('../api/submissions.js').default
let handler: Handler

const submission = {
  id: 'sub-1',
  createdAt: '2026-08-14T00:00:00.000Z',
  status: 'new',
  payload: { formType: 'child' },
}

function mockRes() {
  const json = vi.fn()
  const setHeader = vi.fn()
  const status = vi.fn(() => ({ json, setHeader }))
  return { status, json, setHeader }
}

function mockReq(method: string, opts: { token?: string; id?: string; body?: unknown } = {}) {
  return {
    method,
    headers: opts.token !== undefined ? { 'x-admin-token': opts.token } : {},
    query: opts.id !== undefined ? { id: opts.id } : {},
    body: opts.body,
  }
}

async function adminHeaders() {
  const res = mockRes()
  await sessionHandler({ method: 'POST', body: { password: 'correct horse battery staple' } } as any, res as any)
  return {
    cookie: res.setHeader.mock.calls[0][1] as string,
    'x-csrf-token': res.json.mock.calls[0][0].csrfToken as string,
  }
}

async function adminReq(method: string, opts: { id?: string; body?: unknown } = {}) {
  return { ...mockReq(method, opts), headers: await adminHeaders() }
}

beforeEach(async () => {
  mocks.getSubmissions.mockReset()
  mocks.deleteSubmission.mockReset()
  mocks.updateSubmissionStatus.mockReset()
  vi.resetModules()
  vi.stubEnv('ADMIN_PASSWORD', 'correct horse battery staple')
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a long test session secret that is never deployed')
  handler = (await import('../api/submissions.js')).default
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('submissions API', () => {
  it('GET without token returns 401', async () => {
    const res = mockRes()
    await handler(mockReq('GET') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' })
  })

  it('GET with wrong token returns 401', async () => {
    const res = mockRes()
    await handler(mockReq('GET', { token: 'wrong' }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(mocks.getSubmissions).not.toHaveBeenCalled()
  })

  it('GET with a valid session and CSRF token returns submissions', async () => {
    mocks.getSubmissions.mockResolvedValue([submission])
    const res = mockRes()
    await handler({ method: 'GET', headers: await adminHeaders(), query: {} } as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith([submission])
  })

  it('PATCH updates status with valid id', async () => {
    mocks.updateSubmissionStatus.mockResolvedValue(undefined)
    const res = mockRes()
    await handler(await adminReq('PATCH', { id: 'sub-1', body: { status: 'processed' } }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
    expect(mocks.updateSubmissionStatus).toHaveBeenCalledWith('sub-1', 'processed')
  })

  it('PATCH with missing id returns 400', async () => {
    const res = mockRes()
    await handler(await adminReq('PATCH', { body: { status: 'processed' } }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'id required' })
    expect(mocks.updateSubmissionStatus).not.toHaveBeenCalled()
  })

  it('PATCH with invalid status returns 400', async () => {
    const res = mockRes()
    await handler(await adminReq('PATCH', { id: 'sub-1', body: { status: 'archived' } }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'invalid status' })
  })

  it('DELETE removes a submission', async () => {
    mocks.deleteSubmission.mockResolvedValue(undefined)
    const res = mockRes()
    await handler(await adminReq('DELETE', { id: 'sub-1' }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
    expect(mocks.deleteSubmission).toHaveBeenCalledWith('sub-1')
  })

  it('DELETE with missing id returns 400', async () => {
    const res = mockRes()
    await handler(await adminReq('DELETE') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: 'id required' })
  })

  it('POST returns 405', async () => {
    const res = mockRes()
    await handler(await adminReq('POST') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('returns 500 when storage throws', async () => {
    mocks.getSubmissions.mockRejectedValue(new Error('boom'))
    const res = mockRes()
    await handler(await adminReq('GET') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal error' })
  })
})
