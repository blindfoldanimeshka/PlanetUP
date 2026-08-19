import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { storageMocks } = vi.hoisted(() => ({
  storageMocks: {
    addSubmission: vi.fn(),
    claimSubmissionRateLimit: vi.fn(),
  },
}))

vi.mock('../src/lib/storage.js', () => ({
  addSubmission: storageMocks.addSubmission,
  claimSubmissionRateLimit: storageMocks.claimSubmissionRateLimit,
}))

import handler from '../api/submit-form.js'

const validChildPayload = {
  formType: 'child',
  childName: 'Иван Иванов',
  age: '8',
  hasExperience: 'no',
  phone: '79123456789',
  parentName: 'Мария Иванова',
  source: 'friends',
  consent: true,
}

const validAdultPayload = {
  formType: 'adult',
  name: 'Анна Петрова',
  age: '28',
  previousSportExperience: 'Йога 2 года',
  injuries: 'Нет',
  phone: '79123456789',
  source: 'search',
  consent: true,
}

function mockRes() {
  const json = vi.fn()
  const setHeader = vi.fn()
  const status = vi.fn(() => ({ json, setHeader }))
  return { status, json, setHeader }
}

function mockReq(body: unknown, ip = '127.0.0.1', contentType: string | null = 'application/json') {
  return {
    method: 'POST',
    headers: {
      'x-forwarded-for': ip,
      ...(contentType === null ? {} : { 'content-type': contentType }),
    },
    socket: { remoteAddress: ip },
    body,
  }
}

describe('submit-form handler', () => {
  beforeEach(() => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '8918594362:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA')
    vi.stubEnv('TELEGRAM_CHAT_ID', '12345')
    vi.stubEnv('RESEND_API_KEY', 'resend-key')
    vi.stubEnv('NOTIFICATION_EMAIL', 'admin@example.com')
    storageMocks.addSubmission.mockReset()
    storageMocks.addSubmission.mockResolvedValue(undefined)
    storageMocks.claimSubmissionRateLimit.mockReset()
    storageMocks.claimSubmissionRateLimit.mockResolvedValue(true)
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, text: () => Promise.resolve('{"ok":true}') } as Response)
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('rejects non-POST methods', async () => {
    const res = mockRes()
    await handler({ method: 'GET' } as any, res as any)
    expect(res.status).toHaveBeenCalledWith(405)
  })

  it('rejects non-JSON content types with 415', async () => {
    const res = mockRes()
    await handler(mockReq(validChildPayload, '10.0.0.9', 'text/plain') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(415)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('rejects requests without a content-type header with 415', async () => {
    const res = mockRes()
    await handler(mockReq(validChildPayload, '10.0.0.10', null) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(415)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('sends child data to Telegram with HTML formatting', async () => {
    const res = mockRes()
    await handler(mockReq(validChildPayload, '10.0.0.1') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)

    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
    const telegramCall = calls.find((c: unknown[]) => String(c[0]).includes('api.telegram.org'))
    expect(telegramCall).toBeDefined()

    const body = JSON.parse(telegramCall![1].body)
    expect(body.chat_id).toBe('12345')
    expect(body.parse_mode).toBe('HTML')
    expect(body.disable_web_page_preview).toBe(true)
    expect(body.text).toContain('Новая заявка — ребёнок')
    expect(body.text).toContain('Иван Иванов')
    expect(body.text).toContain('+7 (912) 345-67-89')
  })

  it('sends adult data to Telegram with HTML formatting', async () => {
    const res = mockRes()
    await handler(mockReq(validAdultPayload, '10.0.0.2') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)

    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
    const telegramCall = calls.find((c: unknown[]) => String(c[0]).includes('api.telegram.org'))
    const body = JSON.parse(telegramCall![1].body)
    expect(body.text).toContain('Новая заявка — взрослый')
    expect(body.text).toContain('Анна Петрова')
  })

  it('falls back to plain text when Telegram rejects HTML', async () => {
    let callCount = 0
    globalThis.fetch = vi.fn(() => {
      callCount++
      const htmlError = '{"ok":false,"description":"Bad Request: cant parse entities"}'
      if (callCount <= 3) {
        return Promise.resolve({ ok: true, text: () => Promise.resolve(htmlError) } as Response)
      }
      return Promise.resolve({ ok: true, text: () => Promise.resolve('{"ok":true}') } as Response)
    })

    const res = mockRes()
    await handler(mockReq(validChildPayload, '10.0.0.6') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)

    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
    const telegramCalls = calls.filter((c: unknown[]) => String(c[0]).includes('api.telegram.org'))
    expect(telegramCalls.length).toBe(4)

    const fallbackBody = JSON.parse(telegramCalls[telegramCalls.length - 1][1].body)
    expect(fallbackBody.parse_mode).toBeUndefined()
    expect(fallbackBody.text).toContain('Новая заявка — ребёнок')
  })

  it('returns 200 even if Telegram fails after retries', async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('Internal Server Error') } as Response)
    )

    const res = mockRes()
    await handler(mockReq(validChildPayload, '10.0.0.7') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('returns 200 on honeypot without sending notifications', async () => {
    const res = mockRes()
    await handler(mockReq({ ...validChildPayload, honeypot: 'bot' }, '10.0.0.3') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid payload', async () => {
    const res = mockRes()
    await handler(mockReq({ formType: 'child' }, '10.0.0.4') as any, res as any)
    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('rate limits repeated submissions from the same IP', async () => {
    storageMocks.claimSubmissionRateLimit.mockResolvedValueOnce(true).mockResolvedValueOnce(false)
    const res1 = mockRes()
    const res2 = mockRes()
    await handler(mockReq(validChildPayload, '10.0.0.5') as any, res1 as any)
    await handler(mockReq(validChildPayload, '10.0.0.5') as any, res2 as any)
    expect(res2.status).toHaveBeenCalledWith(429)
  })

  it('does not send notifications when the shared rate limiter rejects a submission', async () => {
    storageMocks.claimSubmissionRateLimit.mockResolvedValue(false)
    const res = mockRes()
    await handler(mockReq(validChildPayload, '10.0.0.8') as any, res as any)

    expect(res.status).toHaveBeenCalledWith(429)
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
