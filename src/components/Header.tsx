import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { CardNav } from '@/components/header/CardNav'

export function Header() {
  const direction = useScrollDirection()

  /* Hide header after scrolling past this point, show again on scroll-up. */
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const shouldHide = scrolled && direction === 'down'

  return (
    <motion.header
      className="sticky top-0 z-50 px-4 pt-3"
      initial={false}
      animate={{ y: shouldHide ? '-100%' : '0%' }}
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
          <CardNav />
        </div>
      </motion.div>
    </motion.header>
  )
}
