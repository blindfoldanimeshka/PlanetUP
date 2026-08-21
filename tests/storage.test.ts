import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from 'vitest'
import type { CmsData } from '../src/types/cms'
import { siteContent } from '../src/data/content'

/* ------------------------------------------------------------------ */
/*  In-memory fake for @upstash/redis                                  */
/*  State lives in module-level Maps shared by every FakeRedis         */
/*  instance, so the instance created by storage.ts and the one used   */
/*  in tests observe the same data.                                    */
/* ------------------------------------------------------------------ */

const { FakeRedis } = vi.hoisted(() => {
  const store = new Map<string, unknown>()
  const lists = new Map<string, unknown[]>()
  const sets = new Map<string, Set<unknown>>()
  let lastSetOpts: { ex?: number } | null = null

  class FakeRedis {
    async get<T>(key: string): Promise<T | null> {
      return (store.get(key) as T) ?? null
    }
    async set(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
      store.set(key, value)
      if (opts) lastSetOpts = opts
    }
    async del(...keys: string[]): Promise<void> {
      for (const k of keys) {
        store.delete(k)
        lists.delete(k)
        sets.delete(k)
      }
    }
    async lpush(key: string, ...values: unknown[]): Promise<void> {
      const current = lists.get(key) ?? []
      current.unshift(...values)
      lists.set(key, current)
    }
    async lrange<T>(key: string): Promise<T[] | null> {
      return (lists.get(key) as T[]) ?? null
    }
    async sadd(key: string, ...values: unknown[]): Promise<void> {
      const current = sets.get(key) ?? new Set<unknown>()
      for (const v of values) current.add(v)
      sets.set(key, current)
    }
    async smembers(key: string): Promise<unknown[]> {
      return Array.from(sets.get(key) ?? [])
    }
    reset(): void {
      store.clear()
      lists.clear()
      sets.clear()
      lastSetOpts = null
    }
    lastOpts(): { ex?: number } | null {
      return lastSetOpts
    }
  }
  return { FakeRedis }
})

vi.mock('@upstash/redis', () => ({ Redis: FakeRedis }))

/* eslint-disable import/first */
import {
  getContent,
  setContent,
  getGroups,
  upsertGroup,
  deleteGroup,
  getSubscriptions,
  upsertSubscription,
  deleteSubscription,
  getTrainers,
  upsertTrainer,
  deleteTrainer,
  getGallery,
  addGalleryItem,
  deleteGalleryItem,
  getLifePosts,
  upsertLifePost,
  deleteLifePost,
  getTestimonials,
  upsertTestimonial,
  deleteTestimonial,
  getSettings,
  updateSettings,
  getAdminState,
  setAdminState,
  clearAdminState,
  getAdminChatIds,
  addAdminChatId,
  isAdmin,
  addSubmission,
  getSubmissions,
  deleteSubmission,
  updateSubmissionStatus,
  getRedisConfig,
} from '../src/lib/storage'
/* eslint-enable import/first */

/* The real client construction now requires UPSTASH_REDIS_REST_URL/TOKEN to be
 * set. The existing tests run against the mocked Redis and don't set those vars,
 * so we provide dummy values here to keep the production check satisfied while
 * the dedicated "missing env" test below temporarily removes them. */
beforeAll(() => {
  process.env.UPSTASH_REDIS_REST_URL = process.env.UPSTASH_REDIS_REST_URL ?? 'http://localhost:6379'
  process.env.UPSTASH_REDIS_REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? 'test-token'
})

const fake = new FakeRedis()

// Spread the current static defaults so baseContent always satisfies CmsData
// even when new CMS fields are introduced.
const baseContent: CmsData = {
  ...siteContent,
  trainers: [],
  subscriptions: [],
  groups: [],
  faq: [],
  testimonials: [],
  lifePosts: [],
  gallery: [],
  settings: {
    ...siteContent.settings,
    phone: '+7 (900) 000-00-00',
    phoneHref: 'tel:+79000000000',
    address: 'Долгопрудный',
    email: 'a@b.ru',
    social: { vk: 'vk.com/x', telegram: 't.me/x', whatsapp: 'wa.me/x' },
    hero: { title: 'T', subtitle: 'S' },
    seo: { title: 'T', description: 'D' },
  },
}

beforeEach(() => {
  fake.reset()
})

describe('content get/set', () => {
  it('returns null before any content is seeded', async () => {
    expect(await getContent()).toBeNull()
  })

  it('round-trips content via setContent/getContent', async () => {
    const data: CmsData = { ...baseContent, groups: [{ id: 'g1', name: 'A', category: 'adults', level: 'l', schedule: [], description: 'd', photoUrl: '/media/a.webp' }] }
    await setContent(data)
    const got = await getContent()
    expect(got?.groups[0].name).toBe('A')
  })
})

describe('groups CRUD', () => {
  it('getGroups returns [] when content missing', async () => {
    expect(await getGroups()).toEqual([])
  })

  it('upsertGroup adds a new group', async () => {
    await setContent({ ...baseContent, groups: [] })
    await upsertGroup({ id: 'g1', name: 'Акробатика', category: 'adults', level: 'Начинающие', schedule: [], description: 'd', photoUrl: '/media/a.webp' })
    const groups = await getGroups()
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('Акробатика')
  })

  it('upsertGroup updates an existing group with the same id', async () => {
    await setContent({
      ...baseContent,
      groups: [{ id: 'g1', name: 'Old', category: 'adults', level: 'l', schedule: [], description: 'd', photoUrl: '/media/a.webp' }],
    })
    await upsertGroup({ id: 'g1', name: 'New', category: 'kids', level: 'l2', schedule: [], description: 'd2', photoUrl: '/media/b.webp' })
    const groups = await getGroups()
    expect(groups).toHaveLength(1)
    expect(groups[0].name).toBe('New')
    expect(groups[0].category).toBe('kids')
  })

  it('deleteGroup removes the group by id', async () => {
    await setContent({
      ...baseContent,
      groups: [
        { id: 'g1', name: 'A', category: 'adults', level: 'l', schedule: [], description: 'd', photoUrl: '/media/a.webp' },
        { id: 'g2', name: 'B', category: 'kids', level: 'l', schedule: [], description: 'd', photoUrl: '/media/b.webp' },
      ],
    })
    await deleteGroup('g1')
    const groups = await getGroups()
    expect(groups.map((g) => g.id)).toEqual(['g2'])
  })

  it('mutate throws when content is not seeded', async () => {
    await expect(upsertGroup({ id: 'g1', name: 'A', category: 'adults', level: 'l', schedule: [], description: 'd', photoUrl: '/media/a.webp' })).rejects.toThrow('Content not seeded')
  })
})

describe('subscriptions CRUD', () => {
  it('adds and updates a subscription', async () => {
    await setContent({ ...baseContent, subscriptions: [] })
    await upsertSubscription({ id: 's1', name: 'Разовое', price: '500 ₽', description: 'd', conditions: 'c', sortOrder: 1 })
    await upsertSubscription({ id: 's1', name: 'Разовое 2', price: '600 ₽', description: 'd', conditions: 'c', sortOrder: 1 })
    const subs = await getSubscriptions()
    expect(subs).toHaveLength(1)
    expect(subs[0].name).toBe('Разовое 2')
    expect(subs[0].sortOrder).toBe(1)
  })

  it('deletes a subscription', async () => {
    await setContent({ ...baseContent, subscriptions: [{ id: 's1', name: 'A', price: 'p', description: 'd', conditions: 'c', sortOrder: 1 }] })
    await deleteSubscription('s1')
    expect(await getSubscriptions()).toEqual([])
  })
})

describe('trainers CRUD', () => {
  it('upserts and deletes trainers', async () => {
    await setContent({ ...baseContent, trainers: [] })
    await upsertTrainer({ id: 't1', name: 'Иван', specialization: 'Акробатика', bio: 'bio', photoUrl: '/media/t.webp' })
    expect(await getTrainers()).toHaveLength(1)
    await upsertTrainer({ id: 't1', name: 'Иван 2', specialization: 's', bio: 'b', photoUrl: '/media/t.webp' })
    expect((await getTrainers())[0].name).toBe('Иван 2')
    await deleteTrainer('t1')
    expect(await getTrainers()).toEqual([])
  })
})

describe('gallery CRUD', () => {
  it('addGalleryItem appends, deleteGalleryItem removes', async () => {
    await setContent({ ...baseContent, gallery: [] })
    await addGalleryItem({ id: 'gal1', photoUrl: '/media/g.webp', category: 'adults', sortOrder: 1 })
    await addGalleryItem({ id: 'gal2', photoUrl: '/media/g2.webp', category: 'kids', sortOrder: 2 })
    const gallery = await getGallery()
    expect(gallery).toHaveLength(2)
    await deleteGalleryItem('gal1')
    expect((await getGallery()).map((x) => x.id)).toEqual(['gal2'])
  })
})

describe('life posts CRUD', () => {
  it('upserts and deletes a life post', async () => {
    await setContent({ ...baseContent, lifePosts: [] })
    await upsertLifePost({ id: 'l1', title: 'Сборы', text: 'text', date: '2026-01-01', coverPhotoUrl: '/media/l.webp', albumPhotoUrls: [] })
    const posts = await getLifePosts()
    expect(posts).toHaveLength(1)
    expect(posts[0].title).toBe('Сборы')
    await deleteLifePost('l1')
    expect(await getLifePosts()).toEqual([])
  })
})

describe('testimonials CRUD', () => {
  it('upserts and deletes a testimonial', async () => {
    await setContent({ ...baseContent, testimonials: [] })
    await upsertTestimonial({ id: 'r1', name: 'Мария', text: 'Отличная студия' })
    expect(await getTestimonials()).toHaveLength(1)
    await upsertTestimonial({ id: 'r1', name: 'Мария', text: 'Обновлено' })
    expect((await getTestimonials())[0].text).toBe('Обновлено')
    await deleteTestimonial('r1')
    expect(await getTestimonials()).toEqual([])
  })
})

describe('settings', () => {
  it('getSettings returns null without content', async () => {
    expect(await getSettings()).toBeNull()
  })

  it('updateSettings persists new values', async () => {
    await setContent(baseContent)
    await updateSettings({ ...baseContent.settings, email: 'new@mail.ru' })
    const settings = await getSettings()
    expect(settings?.email).toBe('new@mail.ru')
  })

  it('updateSettings throws when content not seeded', async () => {
    await expect(updateSettings(baseContent.settings)).rejects.toThrow('Content not seeded')
  })
})

describe('admin state', () => {
  it('setAdminState stores state with 1h TTL and getAdminState reads it back', async () => {
    await setAdminState(123, { section: 'schedule', action: 'add', updatedAt: 1 })
    const state = await getAdminState(123)
    expect(state?.section).toBe('schedule')
    expect(state?.action).toBe('add')
    expect(fake.lastOpts()?.ex).toBe(3600)
  })

  it('getAdminState returns null for unknown chat', async () => {
    expect(await getAdminState(999)).toBeNull()
  })

  it('clearAdminState removes the state', async () => {
    await setAdminState(123, { section: 'team', action: 'edit', targetId: 't1', updatedAt: 1 })
    await clearAdminState(123)
    expect(await getAdminState(123)).toBeNull()
  })
})

describe('admin authorization', () => {
  it('isAdmin returns false before adding any chat', async () => {
    expect(await isAdmin(123)).toBe(false)
  })

  it('addAdminChatId + isAdmin + getAdminChatIds', async () => {
    await addAdminChatId(111)
    await addAdminChatId(222)
    await addAdminChatId(111) // dedup via set
    expect(await isAdmin(111)).toBe(true)
    expect(await isAdmin(222)).toBe(true)
    expect(await isAdmin(333)).toBe(false)
    const ids = await getAdminChatIds()
    expect(ids.sort((a, b) => a - b)).toEqual([111, 222])
  })
})

describe('submissions', () => {
  let ms = 1_700_000_000_000

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockImplementation(() => ++ms)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('addSubmission creates a new submission with status new', async () => {
    const sub = await addSubmission({ formType: 'child' })
    expect(sub.id).toMatch(/^sub-\d+$/)
    expect(sub.status).toBe('new')
    expect(sub.payload).toEqual({ formType: 'child' })
  })

  it('getSubmissions returns [] when empty', async () => {
    expect(await getSubmissions()).toEqual([])
  })

  it('getSubmissions returns stored submissions', async () => {
    await addSubmission({ a: 1 })
    await addSubmission({ a: 2 })
    const subs = await getSubmissions()
    expect(subs).toHaveLength(2)
    expect(subs[0].payload).toEqual({ a: 2 }) // lpush → newest first
  })

  it('deleteSubmission removes by id', async () => {
    const sub1 = await addSubmission({ a: 1 })
    const sub2 = await addSubmission({ a: 2 })
    await deleteSubmission(sub1.id)
    const subs = await getSubmissions()
    expect(subs.map((s) => s.id)).toEqual([sub2.id])
  })

  it('updateSubmissionStatus updates only the matching id', async () => {
    const sub1 = await addSubmission({ a: 1 })
    const sub2 = await addSubmission({ a: 2 })
    await updateSubmissionStatus(sub1.id, 'processed')
    const subs = await getSubmissions()
    const byId = Object.fromEntries(subs.map((s) => [s.id, s]))
    expect(byId[sub1.id].status).toBe('processed')
    expect(byId[sub2.id].status).toBe('new')
  })
})

describe('redis configuration', () => {
  it('getRedisConfig throws when UPSTASH_REDIS_REST_URL/TOKEN are missing', () => {
    const savedUrl = process.env.UPSTASH_REDIS_REST_URL
    const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN
    try {
      delete process.env.UPSTASH_REDIS_REST_URL
      delete process.env.UPSTASH_REDIS_REST_TOKEN
      expect(() => getRedisConfig()).toThrow(/UPSTASH_REDIS_REST_URL/)
    } finally {
      if (savedUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL
      else process.env.UPSTASH_REDIS_REST_URL = savedUrl
      if (savedToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN
      else process.env.UPSTASH_REDIS_REST_TOKEN = savedToken
    }
  })

  it('getRedisConfig throws when only the token is missing', () => {
    const savedUrl = process.env.UPSTASH_REDIS_REST_URL
    const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN
    try {
      process.env.UPSTASH_REDIS_REST_URL = 'http://localhost:6379'
      delete process.env.UPSTASH_REDIS_REST_TOKEN
      expect(() => getRedisConfig()).toThrow(/UPSTASH_REDIS_REST_TOKEN/)
    } finally {
      if (savedUrl === undefined) delete process.env.UPSTASH_REDIS_REST_URL
      else process.env.UPSTASH_REDIS_REST_URL = savedUrl
      if (savedToken === undefined) delete process.env.UPSTASH_REDIS_REST_TOKEN
      else process.env.UPSTASH_REDIS_REST_TOKEN = savedToken
    }
  })
})