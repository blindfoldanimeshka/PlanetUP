// CMS entity types for the local content module (see src/data/content.ts).

export type GroupCategory = 'adults' | 'kids'
export type GalleryCategory = 'adults' | 'kids' | 'competitions'
export type DayOfWeek = 'Пн' | 'Вт' | 'Ср' | 'Чт' | 'Пт' | 'Сб' | 'Вс'

export interface ScheduleItem {
  day: DayOfWeek
  time: string // e.g. "19:00–20:30"
  note?: string // optional group/level hint
}

export interface Trainer {
  id: string
  name: string
  specialization: string
  bio: string
  photoUrl: string
  social?: string
  /** When true the trainer is kept out of the public team section. */
  hidden?: boolean
}

export interface Subscription {
  id: string
  name: string
  price: string // human-readable, e.g. "4 500 ₽/мес"
  description: string
  conditions: string
  sortOrder: number
}

export interface Group {
  id: string
  name: string
  category: GroupCategory
  level: string
  schedule: ScheduleItem[]
  description: string
  photoUrl: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
  sortOrder: number
}

export interface Testimonial {
  id: string
  name: string
  text: string
  photoUrl?: string
}

export interface LifePost {
  id: string
  title: string
  text: string
  date: string // ISO date
  coverPhotoUrl: string
  albumPhotoUrls: string[]
}

export interface GalleryItem {
  id: string
  photoUrl: string
  category: GalleryCategory
  sortOrder: number
}

/** «Наши особенности» — numbered feature card on the overview section. */
export interface FeatureItem {
  id: string
  title: string
  text: string
}

/** Labels for the header navigation (anchors stay fixed, labels are editable). */
export interface NavTexts {
  home: string
  services: string
  adults: string
  kids: string
  subscriptions: string
  studio: string
  team: string
  gallery: string
  life: string
  info: string
  reviews: string
  faq: string
  contacts: string
}

/** Visible headings of every public section (id anchors stay fixed). */
export interface SectionHeadings {
  features: string
  adults: string
  kids: string
  subscriptions: string
  team: string
  gallery: string
  life: string
  reviews: string
  faq: string
  contacts: string
  contactsHowToFind: string
}

/** All client-facing copy of the booking form and its CTA buttons. */
export interface BookingTexts {
  /** Hero CTA + contacts CTA — opens the booking dialog. */
  ctaButton: string
  modalTitle: string
  tabChild: string
  tabAdult: string
  submitButton: string
  submitButtonLoading: string
  successTitle: string
  successText: string
  experienceQuestion: string
  sourceLabel: string
  consentText: string
  injuriesConsentText: string
}

/** Free-form site copy that does not belong to a CRUD entity. */
export interface SiteTexts {
  nav: NavTexts
  headings: SectionHeadings
  booking: BookingTexts
  heroEyebrow: string
  heroNote: string
  teamIntro: string
  scheduleEmptyDay: string
  footerTagline: string
}

export interface SiteSettings {
  phone: string
  phoneHref: string
  address: string
  email: string
  /** Full Yandex Maps widget iframe URL (includes coordinates). */
  mapUrl: string
  social: {
    vk: string
    telegram: string
    whatsapp: string
  }
  hero: {
    title: string
    subtitle: string
  }
  seo: {
    title: string
    description: string
  }
}

export interface CmsData {
  trainers: Trainer[]
  subscriptions: Subscription[]
  groups: Group[]
  faq: FaqItem[]
  testimonials: Testimonial[]
  lifePosts: LifePost[]
  gallery: GalleryItem[]
  features: FeatureItem[]
  settings: SiteSettings
  texts: SiteTexts
}
