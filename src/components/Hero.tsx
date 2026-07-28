import { lazy, Suspense, useMemo } from 'react'
import { motion, useScroll, useTransform, type MotionValue, type TargetAndTransition, type Transition, type Variants } from 'framer-motion'
import { mockCms } from '@/data/mock'

const BookingForm = lazy(() =>
  import('@/components/BookingForm').then((m) => ({ default: m.BookingForm }))
)

/* ------------------------------------------------------------------ */
/*  Starfield — pure CSS particles, animated via Framer Motion         */
/* ------------------------------------------------------------------ */

function Starfield() {
  const { scrollY } = useScroll()
  const parallaxY = useTransform(scrollY, [0, 600], [0, -120])
  const midParallax = useTransform(scrollY, [0, 600], [0, -40])
  const nearParallax = useTransform(scrollY, [0, 600], [0, -80])

  const layers = useMemo(() => {
    const makeStars = (count: number, sizeRange: [number, number], opacityRange: [number, number]) =>
      Array.from({ length: count }, (_, i) => ({
        id: `star-${sizeRange[0]}-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: sizeRange[0] + Math.random() * (sizeRange[1] - sizeRange[0]),
        opacity: opacityRange[0] + Math.random() * (opacityRange[1] - opacityRange[0]),
        delay: Math.random() * 5,
        duration: 2 + Math.random() * 3,
      }))

    return {
      far: makeStars(80, [1, 2], [0.2, 0.5]),
      mid: makeStars(50, [2, 3], [0.4, 0.7]),
      near: makeStars(20, [3, 4], [0.6, 1]),
    }
  }, [])

  const renderLayer = (stars: typeof layers.far, yValue: MotionValue<number>) =>
    stars.map((star) => (
      <motion.div
        key={star.id}
        className="absolute rounded-full bg-white"
        style={{
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          y: yValue,
        }}
        animate={{ opacity: [star.opacity, star.opacity * 0.3, star.opacity] }}
        transition={{
          duration: star.duration,
          repeat: Infinity,
          repeatType: 'reverse',
          delay: star.delay,
        }}
      />
    ))

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ y: parallaxY }}
      aria-hidden="true"
    >
      {renderLayer(layers.far, midParallax)}
      {renderLayer(layers.mid, midParallax)}
      {renderLayer(layers.near, nearParallax)}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Floating glow orbs (ambient atmosphere)                            */
/* ------------------------------------------------------------------ */

const easeInOut: Transition['ease'] = 'easeInOut'
const easeOut: Transition['ease'] = 'easeOut'

function GlowOrbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-cosmic-accent/20 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: easeInOut }}
      />
      <motion.div
        className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-cosmic-accent-2/15 blur-3xl"
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: easeInOut, delay: 2 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: easeInOut, delay: 4 }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Booking form placeholder (non-functional, styled)                   */
/* ------------------------------------------------------------------ */



/* ------------------------------------------------------------------ */
/*  Gradient transition to light content below                         */
/* ------------------------------------------------------------------ */

function HeroGradientFooter() {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
      aria-hidden="true"
      style={{
        background: 'linear-gradient(to bottom, transparent, var(--light-bg))',
      }}
    />
  )
}

/* ------------------------------------------------------------------ */
/*  Hero — full-screen cosmic block                                    */
/* ------------------------------------------------------------------ */

function makeTextVariants(): Variants {
  return {
    hidden: { opacity: 0, y: 30 } satisfies TargetAndTransition,
    visible: (i: number) =>
      ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.2, duration: 0.8, ease: easeOut },
      }) satisfies TargetAndTransition,
  }
}

export function Hero() {
  const { title, subtitle } = mockCms.settings.hero
  const textVariants = makeTextVariants()

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cosmic-bg"
      aria-label="Главный экран — студия акробатики Планета UP"
    >
      {/* Starfield */}
      <Starfield />

      {/* Ambient glow */}
      <GlowOrbs />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center md:py-20">
        {/* Logo text */}
        <motion.div
          className="mb-3 text-sm font-semibold uppercase tracking-widest text-cosmic-accent-2/80"
          initial="hidden"
          animate="visible"
          custom={0}
          variants={textVariants}
        >
          Студия акробатики
        </motion.div>

        {/* Title */}
        <motion.h1
          className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl"
          initial="hidden"
          animate="visible"
          custom={1}
          variants={textVariants}
        >
          {title}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-white/70 md:text-lg"
          initial="hidden"
          animate="visible"
          custom={2}
          variants={textVariants}
        >
          {subtitle}
        </motion.p>

        {/* Booking form */}
        <motion.div
          className="mx-auto max-w-2xl"
          initial="hidden"
          animate="visible"
          custom={3}
          variants={textVariants}
        >
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>
          <p className="mt-3 text-xs text-white/40">
            Пробное занятие — бесплатно. Без обязательств.
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: easeInOut }}
        aria-hidden="true"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1">
          <motion.div
            className="h-2 w-1 rounded-full bg-white/60"
            animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: easeInOut }}
          />
        </div>
      </motion.div>

      {/* Gradient transition to light sections */}
      <HeroGradientFooter />
    </section>
  )
}
