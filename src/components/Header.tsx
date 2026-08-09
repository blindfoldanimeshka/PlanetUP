import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    <header className="sticky top-0 z-50 px-4 pt-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between neu-raised rounded-2xl px-6 py-3">
        <a href="#hero" className="text-lg font-bold tracking-wide text-min-text">
          Планета UP
        </a>
        <nav className="hidden gap-6 text-sm md:flex relative">
          {NAV.map((item) => {
            const isActive = active === item.href.replace('#', '')
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'relative py-1 transition-colors hover:text-min-accent',
                  isActive ? 'text-min-text font-medium' : 'text-min-muted'
                )}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="header-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-min-accent rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
