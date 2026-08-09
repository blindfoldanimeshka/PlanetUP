import { useRef, useEffect, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { animate, svg, stagger } from 'animejs'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface SectionHeadingProps {
  children: ReactNode
  /** Unique class suffix for anime.js SVG target */
  id: string
  /** Optional animated icon from lucide-animated */
  icon?: React.ComponentType<{ size?: number; animateOnHover?: boolean; className?: string }>
}

export function SectionHeading({ children, id, icon: Icon }: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const underlineClass = `section-underline-${id}`

  useEffect(() => {
    if (reduced) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting) return

        // Draw SVG underline
        const drawable = svg.createDrawable(`.${underlineClass}`)
        if (drawable.length > 0) {
          animate(drawable, {
            draw: ['0 0', '1 1'],
            duration: 1200,
            ease: 'inOutQuad',
          })
        }

        // Stagger reveal child cards — scope to nearest section
        const section = el.closest('section')
        const cards = section?.querySelectorAll('[data-stagger-card]')
        if (cards && cards.length > 0) {
          animate(cards, {
            opacity: [0, 1],
            translateY: [30, 0],
            delay: stagger(100, { start: 150 }),
            duration: 700,
            ease: 'easeOutCubic',
          })
        }

        observer.disconnect()
      },
      { threshold: 0.15 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [reduced, underlineClass])

  return (
    <div ref={ref}>
      <motion.div
        initial={reduced ? undefined : { opacity: 0, y: 30 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={reduced ? undefined : { once: true, margin: '-80px' }}
        transition={reduced ? undefined : { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-12 text-center"
      >
        {Icon && (
          <div className="mb-4 flex justify-center">
            <Icon size={32} animateOnHover className="text-min-accent" />
          </div>
        )}
        <h2
          className="font-display leading-tight tracking-tight text-min-text md:text-5xl"
          style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}
        >
          {children}
        </h2>
        <svg
          width="40"
          height="4"
          viewBox="0 0 40 4"
          className="mx-auto mt-4"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="2"
            x2="40"
            y2="2"
            className={underlineClass}
            stroke="var(--min-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="40 40"
            strokeDashoffset="40"
          />
        </svg>
      </motion.div>
    </div>
  )
}