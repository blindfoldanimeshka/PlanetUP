// CMS entity types — mirror the 8 Google Sheets tabs (see docs/PLAN.md).

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

export interface SiteSettings {
  phone: string
  address: string
  email: string
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
  settings: SiteSettings
}
