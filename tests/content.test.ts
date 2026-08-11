import { describe, it, expect } from 'vitest'
import { siteContent } from '../src/data/content'

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
    expect(settings.hero.title.length).toBeGreaterThan(10)
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
})
