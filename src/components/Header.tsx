import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { CardNav } from '@/components/header/CardNav'
import { NAV_ITEMS } from '@/components/header/navItems'

export function Header() {
  const direction = useScrollDirection()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!mobileOpen) return
    const toggle = toggleRef.current
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>('a')
    firstLink?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      toggle?.focus()
    }
  }, [mobileOpen])

  const shouldHide = scrolled && direction === 'down'

  return (
    <motion.header
      className="sticky top-0 z-50 px-4 pt-3"
      initial={false}
      animate={{ y: shouldHide && !mobileOpen ? '-100%' : '0%' }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }}
    >
      <motion.div
        className={cn(
          'mx-auto max-w-6xl rounded-2xl transition-shadow duration-300',
          'glass-surface',
          scrolled && 'shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        )}
      >
        <div className="flex items-center justify-between px-6 py-3">
          <a href="#hero" className="text-lg font-bold tracking-wide text-min-text">
            Планета UP
          </a>
          <div className="flex items-center gap-2">
            <CardNav />
            <button
              ref={toggleRef}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-2xl text-min-text transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-min-accent md:hidden"
              aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              ref={menuRef}
              id="mobile-menu"
              aria-label="Мобильная навигация"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="overflow-hidden md:hidden"
            >
              <div className="flex flex-col gap-1 px-3 pb-4">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label} className="flex flex-col">
                    {item.href ? (
                      <a
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-min-muted transition-colors hover:bg-white/5 hover:text-min-text"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <>
                        <span className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-min-muted">
                          {item.label}
                        </span>
                        {item.links?.map((l) => (
                          <a
                            key={l.href}
                            href={l.href}
                            onClick={() => setMobileOpen(false)}
                            className="rounded-xl px-4 py-2.5 text-sm font-medium text-min-muted transition-colors hover:bg-white/5 hover:text-min-text"
                          >
                            {l.label}
                          </a>
                        ))}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.header>
  )
}
