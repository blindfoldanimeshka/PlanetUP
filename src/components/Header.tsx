import { cn } from '@/lib/cn'

const NAV = [
  { href: '#hero', label: 'Главная' },
  { href: '#adults', label: 'Взрослым' },
  { href: '#kids', label: 'Детям' },
  { href: '#subscriptions', label: 'Абонементы' },
  { href: '#team', label: 'Команда' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#life', label: 'Жизнь' },
  { href: '#reviews', label: 'Отзывы' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contacts', label: 'Контакты' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-cosmic-bg text-white shadow-lg shadow-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <a href="#hero" className="text-lg font-bold tracking-wide">
          Планета <span className="text-cosmic-accent-2">UP</span>
        </a>
        <nav className="hidden gap-4 text-sm md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn('transition-colors hover:text-cosmic-accent-2')}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
