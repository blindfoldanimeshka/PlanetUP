import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'
import type { CmsData, GalleryItem, Group, Subscription, Trainer, LifePost, Testimonial } from '../types/cms.js'

/* ------------------------------------------------------------------ */
/*  Redis connection (lazy)                                             */
/*  Created on first use so env vars are loaded by then.               */
/* ------------------------------------------------------------------ */

let _redis: Redis | null = null

/**
 * Reads and validates the Upstash Redis connection configuration from the
 * environment.
 *
 * Throws a clear Error if either `UPSTASH_REDIS_REST_URL` or
 * `UPSTASH_REDIS_REST_TOKEN` is missing/empty, so a misconfigured deployment
 * fails fast at startup with an actionable message instead of producing
 * cryptic auth errors deep inside the first Redis request.
 */
export function getRedisConfig(): { url: string; token: string } {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    const missing: string[] = []
    if (!url) missing.push('UPSTASH_REDIS_REST_URL')
    if (!token) missing.push('UPSTASH_REDIS_REST_TOKEN')
    throw new Error(
      `Redis is not configured: ${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} not set. ` +
        'Set the Upstash Redis environment variables before starting the app.'
    )
  }
  return { url, token }
}

function getRedis(): Redis {
  if (!_redis) {
    const { url, token } = getRedisConfig()
    _redis = new Redis({ url, token })
  }
  return _redis
}

// Direct access if needed (forces init)
const redis = new Proxy({} as Redis, {
  get(_target, prop) {
    return (getRedis() as any)[prop]
  },
})

/* ------------------------------------------------------------------ */
/*  Keys                                                               */
/* ------------------------------------------------------------------ */

const KEYS = {
  content: 'cms:content',          // full CmsData blob
  adminState: (chatId: number) => `tg:state:${chatId}`,  // conversation state
  adminChatIds: 'tg:admins',       // set of authorized admin chat IDs
} as const

/* ------------------------------------------------------------------ */
/*  Content (whole-site read/write)                                    */
/* ------------------------------------------------------------------ */

export async function getContent(): Promise<CmsData | null> {
  return await redis.get<CmsData>(KEYS.content)
}

export async function setContent(data: CmsData): Promise<void> {
  await redis.set(KEYS.content, data)
}

/* ------------------------------------------------------------------ */
/*  Section helpers — read section, mutate, write back                 */
/* ------------------------------------------------------------------ */

/**
 * Read-modify-write for a single CMS section.
 *
 * NOTE — TOCTOU race condition: this reads the whole `CmsData` blob, applies
 * `fn` in memory, then writes it back. Between the read and the write another
 * writer could mutate the same (or a different) section, and this write would
 * clobber their change (lost update / time-of-check-to-time-of-use).
 *
 * This is acceptable for the current usage: edits are performed exclusively by
 * a single Telegram bot / admin flow at low concurrency, where simultaneous
 * conflicting writes are effectively impossible. A full fix would use a Redis
 * transaction / optimistic locking (WATCH + MULTI/EXEC) on the content key, but
 * that is unnecessary complexity for this access pattern. Revisit if concurrent
 * writers are ever introduced.
 */
async function mutate<T extends keyof CmsData>(
  section: T,
  fn: (current: CmsData[T]) => CmsData[T]
): Promise<CmsData[T]> {
  const current = await getContent()
  if (!current) throw new Error('Content not seeded')
  const next = fn(current[section])
  current[section] = next
  await setContent(current)
  return next
}

/* ---------- Schedule (groups) ---------- */

export async function getGroups(): Promise<Group[]> {
  const c = await getContent()
  return c?.groups ?? []
}

export async function upsertGroup(group: Group): Promise<void> {
  await mutate('groups', (groups: Group[]) => {
    const idx = groups.findIndex((g: Group) => g.id === group.id)
    if (idx >= 0) groups[idx] = group
    else groups.push(group)
    return groups
  })
}

export async function deleteGroup(id: string): Promise<void> {
  await mutate('groups', (groups: Group[]) => groups.filter((g: Group) => g.id !== id))
}

/* ---------- Subscriptions ---------- */

export async function getSubscriptions(): Promise<Subscription[]> {
  const c = await getContent()
  return c?.subscriptions ?? []
}

export async function upsertSubscription(sub: Subscription): Promise<void> {
  await mutate('subscriptions', (subs: Subscription[]) => {
    const idx = subs.findIndex((s: Subscription) => s.id === sub.id)
    if (idx >= 0) subs[idx] = sub
    else subs.push(sub)
    return subs
  })
}

export async function deleteSubscription(id: string): Promise<void> {
  await mutate('subscriptions', (subs: Subscription[]) => subs.filter((s) => s.id !== id))
}

/* ---------- Team ---------- */

export async function getTrainers(): Promise<Trainer[]> {
  const c = await getContent()
  return c?.trainers ?? []
}

export async function upsertTrainer(trainer: Trainer): Promise<void> {
  await mutate('trainers', (t: Trainer[]) => {
    const idx = t.findIndex((x: Trainer) => x.id === trainer.id)
    if (idx >= 0) t[idx] = trainer
    else t.push(trainer)
    return t
  })
}

export async function deleteTrainer(id: string): Promise<void> {
  await mutate('trainers', (t: Trainer[]) => t.filter((x: Trainer) => x.id !== id))
}

/* ---------- Gallery ---------- */

export async function getGallery(): Promise<GalleryItem[]> {
  const c = await getContent()
  return c?.gallery ?? []
}

export async function addGalleryItem(item: GalleryItem): Promise<void> {
  await mutate('gallery', (g) => [...g, item])
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await mutate('gallery', (g: GalleryItem[]) => g.filter((x: GalleryItem) => x.id !== id))
}

/* ---------- Life ---------- */

export async function getLifePosts(): Promise<LifePost[]> {
  const c = await getContent()
  return c?.lifePosts ?? []
}

export async function upsertLifePost(post: LifePost): Promise<void> {
  await mutate('lifePosts', (p: LifePost[]) => {
    const idx = p.findIndex((x: LifePost) => x.id === post.id)
    if (idx >= 0) p[idx] = post
    else p.push(post)
    return p
  })
}

export async function deleteLifePost(id: string): Promise<void> {
  await mutate('lifePosts', (p: LifePost[]) => p.filter((x: LifePost) => x.id !== id))
}

/* ---------- Reviews ---------- */

export async function getTestimonials(): Promise<Testimonial[]> {
  const c = await getContent()
  return c?.testimonials ?? []
}

export async function upsertTestimonial(t: Testimonial): Promise<void> {
  await mutate('testimonials', (r: Testimonial[]) => {
    const idx = r.findIndex((x: Testimonial) => x.id === t.id)
    if (idx >= 0) r[idx] = t
    else r.push(t)
    return r
  })
}

export async function deleteTestimonial(id: string): Promise<void> {
  await mutate('testimonials', (r: Testimonial[]) => r.filter((x: Testimonial) => x.id !== id))
}

/* ---------- Settings (contacts) ---------- */

export async function getSettings(): Promise<CmsData['settings'] | null> {
  const c = await getContent()
  return c?.settings ?? null
}

export async function updateSettings(settings: CmsData['settings']): Promise<void> {
  const current = await getContent()
  if (!current) throw new Error('Content not seeded')
  current.settings = settings
  await setContent(current)
}

/* ------------------------------------------------------------------ */
/*  Admin state (conversation context)                                 */
/* ------------------------------------------------------------------ */

export interface AdminState {
  section: string          // e.g. "schedule", "subscriptions"
  action: string           // e.g. "edit", "add", "awaitingPrice"
  targetId?: string        // item being edited
  draft?: Record<string, unknown>  // partial data being collected
  updatedAt: number
}

export async function getAdminState(chatId: number): Promise<AdminState | null> {
  return await redis.get<AdminState>(KEYS.adminState(chatId))
}

export async function setAdminState(chatId: number, state: AdminState): Promise<void> {
  await redis.set(KEYS.adminState(chatId), state, { ex: 3600 }) // 1h TTL
}

export async function clearAdminState(chatId: number): Promise<void> {
  await redis.del(KEYS.adminState(chatId))
}

/* ------------------------------------------------------------------ */
/*  Admin authorization                                                */
/* ------------------------------------------------------------------ */

export async function getAdminChatIds(): Promise<number[]> {
  const ids = await redis.smembers(KEYS.adminChatIds)
  return ids.map(Number)
}

export async function addAdminChatId(chatId: number): Promise<void> {
  await redis.sadd(KEYS.adminChatIds, chatId)
}

export async function isAdmin(chatId: number): Promise<boolean> {
  const ids = await getAdminChatIds()
  return ids.includes(chatId)
}

/* ---------- Submissions (booking inquiries) ---------- */

const SUBMISSIONS_KEY = 'cms:submissions'
const BOOKING_RATE_LIMIT_SECONDS = 60

export interface Submission {
  id: string
  createdAt: string
  status?: 'new' | 'processed'
  payload: Record<string, unknown>
}

export async function addSubmission(payload: Record<string, unknown>): Promise<Submission> {
  const sub: Submission = {
    id: `sub-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
    payload,
  }
  await redis.lpush(SUBMISSIONS_KEY, sub)
  return sub
}

/** Atomically reserves one booking-form submission per client per minute. */
export async function claimSubmissionRateLimit(clientIp: string): Promise<boolean> {
  const key = createHash('sha256').update(clientIp).digest('hex')
  const result = await redis.set(`rate:booking:${key}`, '1', {
    nx: true,
    ex: BOOKING_RATE_LIMIT_SECONDS,
  })
  return result === 'OK'
}

export async function getSubmissions(): Promise<Submission[]> {
  const raw = await redis.lrange<Submission>(SUBMISSIONS_KEY, 0, -1)
  return raw ?? []
}

export async function deleteSubmission(id: string): Promise<void> {
  const all = await getSubmissions()
  const next = all.filter((s) => s.id !== id)
  await redis.del(SUBMISSIONS_KEY)
  if (next.length > 0) {
    await redis.lpush(SUBMISSIONS_KEY, ...next)
  }
}

export async function updateSubmissionStatus(
  id: string,
  status: 'new' | 'processed'
): Promise<void> {
  const all = await getSubmissions()
  const next = all.map((s) => (s.id === id ? { ...s, status } : s))
  await redis.del(SUBMISSIONS_KEY)
  if (next.length > 0) {
    await redis.lpush(SUBMISSIONS_KEY, ...next)
  }
}

/* ---------- Admin login rate limiting (brute-force protection) ---------- */

const ADMIN_LOGIN_WINDOW_SECONDS = 15 * 60
const ADMIN_LOGIN_MAX_ATTEMPTS = 5

export async function checkAdminLoginRateLimit(
  clientIp: string
): Promise<{ allowed: boolean; retryAfter: number }> {
  const key = `ratelimit:admin:${createHash('sha256').update(clientIp).digest('hex')}`
  const ttl = await redis.ttl(key)
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, ADMIN_LOGIN_WINDOW_SECONDS)
  if (count > ADMIN_LOGIN_MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.max(ttl, 0) }
  }
  return { allowed: true, retryAfter: 0 }
}

export async function resetAdminLoginRateLimit(clientIp: string): Promise<void> {
  await redis.del(`ratelimit:admin:${createHash('sha256').update(clientIp).digest('hex')}`)
}

export { redis }
