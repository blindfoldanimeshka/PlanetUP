import { describe, it, expect } from 'vitest'
import { siteContent } from '../src/data/content'
import { cmsDataSchema } from '../src/lib/cmsSchema'
import { normalizeCmsData } from '../src/lib/cmsNormalize'

const PHONE_REGEX = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/
const MEDIA_PATH_REGEX = /^\/media\/.+\.webp$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

describe('siteContent integrity', () => {
  it('has valid contact settings', () => {
    const { settings } = siteContent
    expect(settings.phone).toMatch(PHONE_REGEX)
    expect(settings.phoneHref).toMatch(/^tel:\+7\d{10}$/)
    expect(settings.address).toContain('Долгопрудный')
    expect(settings.email).toMatch(EMAIL_REGEX)
    expect(settings.social.vk).toContain('vk.com/planetaupacro')
    expect(settings.social.telegram).toContain('t.me/')
    expect(settings.social.whatsapp).toContain('wa.me/')
  })

  it('has non-empty SEO and hero blocks', () => {
    const { settings } = siteContent
    // Hero title is the short brand name «Планета UP» (exactly 10 chars).
    expect(settings.hero.title.length).toBeGreaterThanOrEqual(10)
    expect(settings.hero.subtitle.length).toBeGreaterThan(20)
    expect(settings.seo.title.length).toBeGreaterThan(10)
    expect(settings.seo.description.length).toBeGreaterThan(30)
  })

  it('has at least one trainer', () => {
    expect(siteContent.trainers.length).toBeGreaterThan(0)
    for (const t of siteContent.trainers) {
      expect(t.name).toBeTruthy()
      expect(t.bio).toBeTruthy()
      expect(t.photoUrl).toMatch(MEDIA_PATH_REGEX)
    }
  })

  it('has subscription options sorted', () => {
    expect(siteContent.subscriptions.length).toBeGreaterThan(0)
    const orders = siteContent.subscriptions.map((s) => s.sortOrder)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))
  })

  it('has groups for adults and kids with schedules', () => {
    const adults = siteContent.groups.filter((g) => g.category === 'adults')
    const kids = siteContent.groups.filter((g) => g.category === 'kids')
    expect(adults.length).toBeGreaterThan(0)
    expect(kids.length).toBeGreaterThan(0)
    for (const g of siteContent.groups) {
      expect(g.schedule.length).toBeGreaterThan(0)
      expect(g.photoUrl).toMatch(MEDIA_PATH_REGEX)
    }
  })

  it('has FAQ items with questions and answers', () => {
    expect(siteContent.faq.length).toBeGreaterThan(0)
    for (const item of siteContent.faq) {
      expect(item.question.length).toBeGreaterThan(5)
      expect(item.answer.length).toBeGreaterThan(10)
    }
  })

  it('has at least 10 testimonials from OCR', () => {
    expect(siteContent.testimonials.length).toBeGreaterThanOrEqual(10)
    for (const t of siteContent.testimonials) {
      expect(t.name).toBeTruthy()
      expect(t.text.length).toBeGreaterThan(10)
    }
  })

  it('has life posts with cover and album photos', () => {
    expect(siteContent.lifePosts.length).toBeGreaterThan(0)
    for (const post of siteContent.lifePosts) {
      expect(post.coverPhotoUrl).toMatch(MEDIA_PATH_REGEX)
      expect(post.albumPhotoUrls.length).toBeGreaterThan(0)
      for (const url of post.albumPhotoUrls) {
        expect(url).toMatch(MEDIA_PATH_REGEX)
      }
    }
  })

  it('has gallery images with valid categories', () => {
    expect(siteContent.gallery.length).toBeGreaterThan(0)
    const validCategories = ['adults', 'kids', 'competitions'] as const
    for (const item of siteContent.gallery) {
      expect(validCategories).toContain(item.category)
      expect(item.photoUrl).toMatch(MEDIA_PATH_REGEX)
    }
  })

  it('has non-empty texts for every client-facing string', () => {
    const { texts } = siteContent
    for (const value of Object.values(texts.nav)) expect(value.trim()).not.toBe('')
    for (const value of Object.values(texts.headings)) expect(value.trim()).not.toBe('')
    for (const value of Object.values(texts.booking)) expect(value.trim()).not.toBe('')
    expect(texts.heroEyebrow.trim()).not.toBe('')
    expect(texts.heroNote.trim()).not.toBe('')
    expect(texts.teamIntro.length).toBeGreaterThan(20)
    expect(texts.scheduleEmptyDay.trim()).not.toBe('')
    expect(texts.footerTagline.trim()).not.toBe('')
  })

  it('has features with title and text', () => {
    expect(siteContent.features.length).toBeGreaterThan(0)
    for (const f of siteContent.features) {
      expect(f.title.trim()).not.toBe('')
      expect(f.text.trim()).not.toBe('')
    }
  })
})

describe('cmsDataSchema', () => {
  it('accepts the full static content', () => {
    expect(cmsDataSchema.safeParse(siteContent).success).toBe(true)
  })

  it('rejects blobs missing required keys (e.g. legacy data without texts)', () => {
    const { texts: _t, features: _f, ...legacy } = siteContent
    expect(cmsDataSchema.safeParse(legacy).success).toBe(false)
  })

  it('accepts the optional trainer hidden flag', () => {
    const withHidden = {
      ...siteContent,
      trainers: [{ ...siteContent.trainers[0], hidden: true }],
    }
    expect(cmsDataSchema.safeParse(withHidden).success).toBe(true)
  })
})

describe('normalizeCmsData', () => {
  it('fills missing features/texts/mapUrl from defaults (legacy blob)', () => {
    const { texts: _t, features: _f, settings, ...legacy } = siteContent
    const legacySettings = { ...settings }
    delete (legacySettings as { mapUrl?: string }).mapUrl
    const normalized = normalizeCmsData({ ...legacy, settings: legacySettings })
    expect(normalized.features).toEqual(siteContent.features)
    expect(normalized.texts).toEqual(siteContent.texts)
    expect(normalized.settings.mapUrl).toBe(siteContent.settings.mapUrl)
  })

  it('passes the normalized blob through the strict schema', () => {
    const { texts: _t, ...partial } = siteContent
    expect(cmsDataSchema.safeParse(normalizeCmsData(partial)).success).toBe(true)
  })

  it('preserves deliberately emptied arrays instead of resurrecting defaults', () => {
    const stored = { ...siteContent, trainers: [] }
    const normalized = normalizeCmsData(stored)
    expect(normalized.trainers).toEqual([])
  })

  it('returns full defaults for null/undefined input', () => {
    expect(normalizeCmsData(null)).toEqual(siteContent)
    expect(normalizeCmsData(undefined)).toEqual(siteContent)
  })
})
