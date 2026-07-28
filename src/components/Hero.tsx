import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { mockCms } from '@/data/mock'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const BookingForm = lazy(() =>
  import('@/components/BookingForm').then((m) => ({ default: m.BookingForm }))
)

/* ------------------------------------------------------------------ */
/*  Minimal scroll indicator — thin line, no animation                  */
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
/*  Hero — exaggerated minimalism                                       */
/* ------------------------------------------------------------------ */

export function Hero() {
  const { title, subtitle } = mockCms.settings.hero
  const reduced = useReducedMotion()

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center bg-min-bg px-4"
      aria-label="Главный экран — студия акробатики Планета UP"
    >
      <div className="mx-auto max-w-4xl text-center">
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
          className="mb-6 font-display leading-none tracking-tight text-min-text"
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
        >
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
          <p className="mt-4 text-xs text-min-muted">
            Пробное занятие — бесплатно. Без обязательств.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}
