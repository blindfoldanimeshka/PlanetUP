import { lazy, Suspense, useState } from 'react'
import { motion, useScroll, useTransform, type MotionValue, type TargetAndTransition, type Transition, type Variants } from 'framer-motion'
import { mockCms } from '@/data/mock'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const BookingForm = lazy(() =>
  import('@/components/BookingForm').then((m) => ({ default: m.BookingForm }))
)

/* ------------------------------------------------------------------ */
/*  Starfield — 5-layer CSS particles with parallax                    */
/* ------------------------------------------------------------------ */

function Starfield() {
  const { scrollY } = useScroll()
  const reduced = useReducedMotion()

  const deepParallax = useTransform(scrollY, [0, 800], [0, -20])
  const farParallax = useTransform(scrollY, [0, 600], [0, -120])
  const midParallax = useTransform(scrollY, [0, 600], [0, -40])
  const nearParallax = useTransform(scrollY, [0, 600], [0, -80])
  const auroraParallax = useTransform(scrollY, [0, 800], [0, -60])
  const zero = useTransform(() => 0)

  const [layers] = useState(() => {
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

    const makeAurora = (count: number) =>
      Array.from({ length: count }, (_, i) => ({
        id: `aurora-${i}`,
        left: `${Math.random() * 100}%`,
        top: `${20 + Math.random() * 60}%`,
        size: 2 + Math.random() * 4,
        opacity: 0.15 + Math.random() * 0.25,
        delay: Math.random() * 6,
        duration: 3 + Math.random() * 4,
        color: ['#7c3aed', '#a855f7', '#c084fc', '#818cf8', '#6366f1'][
          Math.floor(Math.random() * 5)
        ],
      }))

    return {
      deep: makeStars(40, [0.5, 1], [0.1, 0.3]),
      far: makeStars(40, [1, 2], [0.2, 0.5]),
      mid: makeStars(30, [2, 3], [0.4, 0.7]),
      near: makeStars(15, [3, 4], [0.6, 1]),
      aurora: makeAurora(25),
    }
  })

  const yFor = (mv: MotionValue<number>) => (reduced ? zero : mv)

  const renderLayer = (
    stars: typeof layers.far,
    yValue: MotionValue<number>,
    isAurora = false,
  ) =>
    stars.map((star) => (
      <motion.div
        key={star.id}
        className="absolute rounded-full"
        style={{
          left: star.left,
          top: star.top,
          width: star.size,
          height: star.size,
          y: yValue,
          background: isAurora && 'color' in star ? (star as { color: string }).color : 'white',
        }}
        animate={
          reduced
            ? {}
            : { opacity: [star.opacity, star.opacity * 0.3, star.opacity] }
        }
        transition={
          reduced
            ? {}
            : {
                duration: star.duration,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: star.delay,
              }
        }
      />
    ))

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {renderLayer(layers.deep, yFor(deepParallax))}
      {renderLayer(layers.far, yFor(farParallax))}
      {renderLayer(layers.mid, yFor(midParallax))}
      {renderLayer(layers.near, yFor(nearParallax))}
      {renderLayer(layers.aurora, yFor(auroraParallax), true)}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Floating glow orbs (ambient atmosphere)                            */
/* ------------------------------------------------------------------ */

const easeInOut: Transition['ease'] = 'easeInOut'
const easeOut: Transition['ease'] = 'easeOut'

function GlowOrbs() {
  const { scrollY } = useScroll()
  const reduced = useReducedMotion()

  const orb1Y = useTransform(scrollY, [0, 600], [0, -80])
  const orb2Y = useTransform(scrollY, [0, 600], [0, -50])
  const orb3Y = useTransform(scrollY, [0, 600], [0, -100])
  const zero = useTransform(() => 0)

  const yFor = (mv: MotionValue<number>) => (reduced ? zero : mv)

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        className="absolute -left-32 top-1/4 h-64 w-64 rounded-full bg-cosmic-accent/20 blur-3xl"
        style={{ y: yFor(orb1Y) }}
        animate={
          reduced
            ? {}
            : { scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }
        }
        transition={
          reduced
            ? {}
            : { duration: 8, repeat: Infinity, ease: easeInOut }
        }
      />
      <motion.div
        className="absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-cosmic-accent-2/15 blur-3xl"
        style={{ y: yFor(orb2Y) }}
        animate={
          reduced
            ? {}
            : { scale: [1.1, 0.9, 1.1], opacity: [0.1, 0.2, 0.1] }
        }
        transition={
          reduced
            ? {}
            : { duration: 10, repeat: Infinity, ease: easeInOut, delay: 2 }
        }
      />
      <motion.div
        className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"
        style={{ y: yFor(orb3Y) }}
        animate={
          reduced
            ? {}
            : { scale: [0.9, 1.1, 0.9], opacity: [0.08, 0.18, 0.08] }
        }
        transition={
          reduced
            ? {}
            : { duration: 12, repeat: Infinity, ease: easeInOut, delay: 4 }
        }
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
  const { scrollY } = useScroll()
  const reduced = useReducedMotion()

  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const contentScale = useTransform(scrollY, [0, 400], [1, 0.95])
  const contentY = useTransform(scrollY, [0, 400], [0, -50])
  const zeroOpacity = useTransform(() => 1)
  const oneScale = useTransform(() => 1)
  const zeroY = useTransform(() => 0)

  const contentStyle = reduced
    ? { opacity: zeroOpacity, scale: oneScale, y: zeroY }
    : { opacity: contentOpacity, scale: contentScale, y: contentY }

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
      <motion.div
        className="relative z-10 mx-auto max-w-4xl px-4 py-16 text-center md:py-20"
        style={contentStyle}
      >
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
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2"
        animate={reduced ? {} : { y: [0, 8, 0] }}
        transition={reduced ? {} : { duration: 2, repeat: Infinity, ease: easeInOut }}
        aria-hidden="true"
      >
        <div className="flex h-10 w-6 items-start justify-center rounded-full border-2 border-white/30 p-1">
          <motion.div
            className="h-2 w-1 rounded-full bg-white/60"
            animate={reduced ? {} : { y: [0, 12, 0], opacity: [1, 0.3, 1] }}
            transition={reduced ? {} : { duration: 2, repeat: Infinity, ease: easeInOut }}
          />
        </div>
      </motion.div>

      {/* Gradient transition to light sections */}
      <HeroGradientFooter />
    </section>
  )
}
