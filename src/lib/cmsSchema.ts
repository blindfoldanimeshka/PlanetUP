import { z } from 'zod'

/**
 * Maximum accepted Content-Length for PUT /api/content (bytes).
 * ~1 MB — generous for the full CMS payload, but caps abuse.
 */
export const MAX_BODY_SIZE = 1_000_000

// ── Leaf enums ──────────────────────────────────────────────
const groupCategorySchema = z.enum(['adults', 'kids'])
const galleryCategorySchema = z.enum(['adults', 'kids', 'competitions'])
const dayOfWeekSchema = z.enum(['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'])

// ── Sub-schemas ─────────────────────────────────────────────
const scheduleItemSchema = z
  .object({
    day: dayOfWeekSchema,
    time: z.string(),
    note: z.string().optional(),
  })
  .strict()

const trainerSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    specialization: z.string(),
    bio: z.string(),
    photoUrl: z.string(),
    social: z.string().optional(),
    hidden: z.boolean().optional(),
  })
  .strict()

const subscriptionSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    price: z.string(),
    description: z.string(),
    conditions: z.string(),
    sortOrder: z.number(),
  })
  .strict()

const groupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    category: groupCategorySchema,
    level: z.string(),
    schedule: z.array(scheduleItemSchema),
    description: z.string(),
    photoUrl: z.string(),
  })
  .strict()

const faqItemSchema = z
  .object({
    id: z.string(),
    question: z.string(),
    answer: z.string(),
    sortOrder: z.number(),
  })
  .strict()

const testimonialSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    text: z.string(),
    photoUrl: z.string().optional(),
  })
  .strict()

const lifePostSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    text: z.string(),
    date: z.string(),
    coverPhotoUrl: z.string(),
    albumPhotoUrls: z.array(z.string()),
  })
  .strict()

const galleryItemSchema = z
  .object({
    id: z.string(),
    photoUrl: z.string(),
    category: galleryCategorySchema,
    sortOrder: z.number(),
  })
  .strict()

const featureItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    text: z.string(),
  })
  .strict()

const navTextsSchema = z
  .object({
    home: z.string(),
    services: z.string(),
    adults: z.string(),
    kids: z.string(),
    subscriptions: z.string(),
    studio: z.string(),
    team: z.string(),
    gallery: z.string(),
    life: z.string(),
    info: z.string(),
    reviews: z.string(),
    faq: z.string(),
    contacts: z.string(),
  })
  .strict()

const sectionHeadingsSchema = z
  .object({
    features: z.string(),
    adults: z.string(),
    kids: z.string(),
    subscriptions: z.string(),
    team: z.string(),
    gallery: z.string(),
    life: z.string(),
    reviews: z.string(),
    faq: z.string(),
    contacts: z.string(),
    contactsHowToFind: z.string(),
  })
  .strict()

const bookingTextsSchema = z
  .object({
    ctaButton: z.string(),
    modalTitle: z.string(),
    tabChild: z.string(),
    tabAdult: z.string(),
    submitButton: z.string(),
    submitButtonLoading: z.string(),
    successTitle: z.string(),
    successText: z.string(),
    experienceQuestion: z.string(),
    sourceLabel: z.string(),
    consentText: z.string(),
    injuriesConsentText: z.string(),
  })
  .strict()

const siteTextsSchema = z
  .object({
    nav: navTextsSchema,
    headings: sectionHeadingsSchema,
    booking: bookingTextsSchema,
    heroEyebrow: z.string(),
    heroNote: z.string(),
    teamIntro: z.string(),
    scheduleEmptyDay: z.string(),
    footerTagline: z.string(),
  })
  .strict()

const siteSettingsSchema = z
  .object({
    phone: z.string(),
    phoneHref: z.string(),
    address: z.string(),
    email: z.string(),
    mapUrl: z.string(),
    social: z
      .object({
        vk: z.string(),
        telegram: z.string(),
        whatsapp: z.string(),
      })
      .strict(),
    hero: z
      .object({
        title: z.string(),
        subtitle: z.string(),
      })
      .strict(),
    seo: z
      .object({
        title: z.string(),
        description: z.string(),
      })
      .strict(),
  })
  .strict()

// ── Root schema ─────────────────────────────────────────────
export const cmsDataSchema = z
  .object({
    trainers: z.array(trainerSchema),
    subscriptions: z.array(subscriptionSchema),
    groups: z.array(groupSchema),
    faq: z.array(faqItemSchema),
    testimonials: z.array(testimonialSchema),
    lifePosts: z.array(lifePostSchema),
    gallery: z.array(galleryItemSchema),
    features: z.array(featureItemSchema),
    settings: siteSettingsSchema,
    texts: siteTextsSchema,
  })
  .strict()
