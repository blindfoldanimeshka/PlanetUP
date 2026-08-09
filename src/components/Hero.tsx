import { lazy, Suspense, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { animate, svg } from 'animejs'
import { mockCms } from '@/data/mock'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { ArrowRightIcon } from '@/components/icons/arrow-right'

const BookingForm = lazy(() =>
  import('@/components/BookingForm').then((m) => ({ default: m.BookingForm }))
)

/* ------------------------------------------------------------------ */
/*  Minimal scroll indicator — thin line                               */
/* ------------------------------------------------------------------ */

function ScrollIndicator() {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      aria-hidden="true"
    >
      <div className="h-12 w-px bg-min-border" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero — exaggerated minimalism with Motion + anime.js               */
/* ------------------------------------------------------------------ */

export function Hero() {
  const { title, subtitle } = mockCms.settings.hero
  const reduced = useReducedMotion()

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -30])

  useEffect(() => {
    if (reduced) return
    const [drawable] = svg.createDrawable('.hero-underline')
    animate(drawable, {
      draw: ['0 0', '1 1'],
      duration: 1500,
      ease: 'inOutQuad',
    })
  }, [reduced])

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center px-4"
      aria-label="Главный экран — студия акробатики Планета UP"
    >
      <motion.div
        className="mx-auto max-w-4xl text-center"
        style={reduced ? undefined : { y: heroY }}
      >
        {/* Eyebrow */}
        <motion.p
          className="mb-6 text-sm font-medium uppercase tracking-widest text-min-muted"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, ease: 'easeOut' }}
        >
          Студия акробатики
        </motion.p>

        {/* Massive headline */}
        <motion.h1
          className="mb-4 font-display leading-none tracking-tight text-min-text"
          style={{
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
          }}
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, ease: 'easeOut' }}
        >
          {title}
        </motion.h1>

        {/* SVG decorative underline — anime.js draw animation */}
        <svg
          width="60"
          height="4"
          viewBox="0 0 60 4"
          className="mx-auto mb-8"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="2"
            x2="60"
            y2="2"
            className="hero-underline"
            stroke="var(--min-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60 60"
            strokeDashoffset="60"
          />
        </svg>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mb-12 max-w-xl text-lg leading-relaxed text-min-muted"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, ease: 'easeOut' }}
        >
          {subtitle}
        </motion.p>

        {/* Booking form */}
        <motion.div
          className="mx-auto max-w-2xl"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, ease: 'easeOut' }}
          whileHover={reduced ? undefined : { scale: 1.01 }}
        >
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-min-muted">
            <span>Пробное занятие — бесплатно. Без обязательств.</span>
            <ArrowRightIcon className="inline-block text-min-accent" size={16} />
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}