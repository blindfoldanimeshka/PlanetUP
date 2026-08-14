import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const { storageMocks, botMocks } = vi.hoisted(() => ({
  storageMocks: {
    getAdminState: vi.fn(),
    isAdmin: vi.fn(),
  },
  botMocks: {
    handleCommand: vi.fn(),
    handleCallback: vi.fn(),
  },
}))

vi.mock('../src/lib/storage.js', () => ({
  getAdminState: storageMocks.getAdminState,
  isAdmin: storageMocks.isAdmin,
}))

vi.mock('../api/tg/bot.js', () => ({
  handleCommand: botMocks.handleCommand,
  handleCallback: botMocks.handleCallback,
}))

import handler from '../api/tg/webhook.js'

const TOKEN = '8918594362:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
const WEBHOOK_SECRET = 'telegram-test-webhook-secret-value'

function mockRes() {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  return { status, json }
}

function messageUpdate(chatId: number, overrides: Record<string, unknown> = {}) {
  return {
    method: 'POST',
    headers: { 'x-telegram-bot-api-secret-token': WEBHOOK_SECRET },
    body: { message: { chat: { id: chatId }, ...overrides } },
  }
}

function callbackUpdate(chatId: number, data: string, cbId = 'cq-1') {
  return {
    method: 'POST',
    headers: { 'x-telegram-bot-api-secret-token': WEBHOOK_SECRET },
    body: { callback_query: { id: cbId, message: { chat: { id: chatId } }, data } },
  }
}

beforeEach(() => {
  vi.stubEnv('TELEGRAM_BOT_TOKEN', TOKEN)
  vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', WEBHOOK_SECRET)
  storageMocks.getAdminState.mockReset()
  storageMocks.isAdmin.mockReset()
  botMocks.handleCommand.mockReset()
  botMocks.handleCallback.mockReset()
  globalThis.fetch = vi.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) } as Response)
  )
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('tg webhook', () => {
  it('rejects a request without Telegram webhook secret before reading its update', async () => {
    const res = mockRes()
    await handler({ method: 'POST', headers: {}, body: { message: { chat: { id: 123 }, text: '/menu' } } } as any, res as any)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(storageMocks.isAdmin).not.toHaveBeenCalled()
  })

  it('rejects non-POST methods with 405', async () => {
    const res = mockRes()
    await handler({ method: 'GET' } as any, res as any)
    expect(res.status).toHaveBeenCalledWith(405)
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('acks with 200 when TELEGRAM_BOT_TOKEN is not set', async () => {
    vi.stubEnv('TELEGRAM_BOT_TOKEN', '')
    const res = mockRes()
    await handler({ method: 'POST', headers: { 'x-telegram-bot-api-secret-token': WEBHOOK_SECRET }, body: {} } as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  it('blocks non-admin message with access-denied reply', async () => {
    storageMocks.isAdmin.mockResolvedValue(false)
    const res = mockRes()
    await handler(messageUpdate(999, { text: '/menu' }) as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(globalThis.fetch).toHaveBeenCalled()
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body.text).toContain('⛔ Нет доступа')
    expect(botMocks.handleCommand).not.toHaveBeenCalled()
  })

  it('routes photo message with awaitingPhoto state to handleCallback', async () => {
    storageMocks.isAdmin.mockResolvedValue(true)
    const state = { section: 'gallery', action: 'awaitingPhoto', updatedAt: 1 }
    storageMocks.getAdminState.mockResolvedValue(state)
    const photo = [{ file_id: 'f1', width: 100, height: 100 }]
    const res = mockRes()
    await handler(messageUpdate(123, { photo }) as any, res as any)

    expect(botMocks.handleCallback).toHaveBeenCalledWith(TOKEN, 123, { type: 'photo', photo }, state)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('ignores photo without awaitingPhoto state', async () => {
    storageMocks.isAdmin.mockResolvedValue(true)
    storageMocks.getAdminState.mockResolvedValue(null)
    const res = mockRes()
    await handler(messageUpdate(123, { photo: [{ file_id: 'f1' }] }) as any, res as any)

    expect(botMocks.handleCallback).not.toHaveBeenCalled()
    // falls through to "no state, no command" help message
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('routes command messages to handleCommand', async () => {
    storageMocks.isAdmin.mockResolvedValue(true)
    const res = mockRes()
    await handler(messageUpdate(123, { text: '  /menu  ' }) as any, res as any)

    expect(botMocks.handleCommand).toHaveBeenCalledWith(TOKEN, 123, '/menu')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('routes plain text with existing state to handleCallback', async () => {
    storageMocks.isAdmin.mockResolvedValue(true)
    const state = { section: 'schedule', action: 'add', updatedAt: 1 }
    storageMocks.getAdminState.mockResolvedValue(state)
    const res = mockRes()
    await handler(messageUpdate(123, { text: 'Акробатика' }) as any, res as any)

    expect(botMocks.handleCallback).toHaveBeenCalledWith(TOKEN, 123, { type: 'text', text: 'Акробатика' }, state)
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('shows help for text with no state and no command', async () => {
    storageMocks.isAdmin.mockResolvedValue(true)
    storageMocks.getAdminState.mockResolvedValue(null)
    const res = mockRes()
    await handler(messageUpdate(123, { text: 'hello' }) as any, res as any)

    expect(res.status).toHaveBeenCalledWith(200)
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(call[1].body)
    expect(body.text).toContain('Напишите /start')
  })

  it('routes callback query to handleCallback and acks it', async () => {
    storageMocks.isAdmin.mockResolvedValue(true)
    storageMocks.getAdminState.mockResolvedValue(null)
    const res = mockRes()
    await handler(callbackUpdate(123, 'sec:schedule') as any, res as any)

    expect(botMocks.handleCallback).toHaveBeenCalledWith(TOKEN, 123, { type: 'callback', data: 'sec:schedule' }, undefined)
    // answerCallbackQuery ack call
    const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls
    const ackCall = calls.find((c: unknown[]) => String(c[0]).includes('answerCallbackQuery'))
    expect(ackCall).toBeDefined()
    const ackBody = JSON.parse((ackCall![1] as { body: string }).body)
    expect(ackBody.callback_query_id).toBe('cq-1')
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('silently ignores callback from non-admin', async () => {
    storageMocks.isAdmin.mockResolvedValue(false)
    const res = mockRes()
    await handler(callbackUpdate(999, 'sec:schedule') as any, res as any)

    expect(botMocks.handleCallback).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('always acks 200 even when storage throws', async () => {
    storageMocks.isAdmin.mockRejectedValue(new Error('redis down'))
    const res = mockRes()
    await handler(messageUpdate(123, { text: '/menu' }) as any, res as any)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ ok: true })
  })
})
