import { useState, useEffect } from 'react'
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
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const sections = NAV.map((n) => n.href.replace('#', ''))
    const observers: IntersectionObserver[] = []

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { threshold: 0.3 }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-min-bg/95 backdrop-blur-sm border-b border-min-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="#hero" className="text-lg font-bold tracking-wide text-min-text">
          Планета UP
        </a>
        <nav className="hidden gap-6 text-sm md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'transition-colors hover:text-min-accent text-min-muted',
                active === item.href.replace('#', '') && 'text-min-text font-medium'
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
