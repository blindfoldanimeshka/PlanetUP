export interface NavLink {
  href: string
  label: string
}

export interface NavItem {
  label: string
  href?: string
  links?: NavLink[]
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Главная', href: '#hero' },
  {
    label: 'Услуги',
    links: [
      { href: '#adults', label: 'Взрослым' },
      { href: '#kids', label: 'Детям' },
      { href: '#subscriptions', label: 'Абонементы' },
    ],
  },
  {
    label: 'Студия',
    links: [
      { href: '#team', label: 'Команда' },
      { href: '#gallery', label: 'Галерея' },
      { href: '#life', label: 'Жизнь' },
    ],
  },
  {
    label: 'Инфо',
    links: [
      { href: '#reviews', label: 'Отзывы' },
      { href: '#faq', label: 'FAQ' },
      { href: '#contacts', label: 'Контакты' },
    ],
  },
]
