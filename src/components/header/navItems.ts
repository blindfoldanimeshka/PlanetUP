import type { NavTexts } from '@/types/cms'

export interface NavLink {
  href: string
  label: string
}

export interface NavItem {
  label: string
  href?: string
  links?: NavLink[]
}

/** Fallback labels — used until CMS content is loaded (and in static builds). */
export const DEFAULT_NAV_TEXTS: NavTexts = {
  home: 'Главная',
  services: 'Услуги',
  adults: 'Взрослым',
  kids: 'Детям',
  subscriptions: 'Абонементы',
  studio: 'Студия',
  team: 'Команда',
  gallery: 'Галерея',
  life: 'Жизнь',
  info: 'Инфо',
  reviews: 'Отзывы',
  faq: 'FAQ',
  contacts: 'Контакты',
}

/**
 * Anchor targets are structural (must match section ids); only the visible
 * labels come from the CMS (`cms.texts.nav`).
 */
export function buildNavItems(t: NavTexts): NavItem[] {
  return [
    { label: t.home, href: '#hero' },
    {
      label: t.services,
      links: [
        { href: '#adults', label: t.adults },
        { href: '#kids', label: t.kids },
        { href: '#subscriptions', label: t.subscriptions },
      ],
    },
    {
      label: t.studio,
      links: [
        { href: '#team', label: t.team },
        { href: '#gallery', label: t.gallery },
        { href: '#life', label: t.life },
      ],
    },
    {
      label: t.info,
      links: [
        { href: '#reviews', label: t.reviews },
        { href: '#faq', label: t.faq },
        { href: '#contacts', label: t.contacts },
      ],
    },
  ]
}

export const NAV_ITEMS: NavItem[] = buildNavItems(DEFAULT_NAV_TEXTS)
