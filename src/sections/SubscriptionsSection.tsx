import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import type { CmsData, Subscription } from '@/types/cms'
import { scrollToHero } from '@/lib/scroll'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// --- Scene wrapper ---

function SceneWrapper({
  opacity,
  y,
  children,
}: {
  opacity: import('framer-motion').MotionValue<number>
  y: import('framer-motion').MotionValue<number>
  children: React.ReactNode
}) {
  return (
    <motion.div
      style={{
        opacity,
        y,
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {children}
    </motion.div>
  )
}

// --- Scene components ---

function SubscriptionCard({ subscription, index }: { subscription: Subscription; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-light-text">{subscription.name}</h3>
        <p className="text-2xl font-extrabold text-cosmic-accent">{subscription.price}</p>
        <p className="text-sm leading-relaxed text-light-muted">{subscription.description}</p>
        <p className="text-xs text-light-muted/80 border-t border-light-border pt-3">
          {subscription.conditions}
        </p>
        <Button
          variant="primary"
          size="md"
          className="mt-2 self-start"
          onClick={scrollToHero}
        >
          Записаться
        </Button>
      </Card>
    </motion.div>
  )
}

function SubscriptionScene1({ sorted }: { sorted: Subscription[] }) {
  return (
    <>
      <motion.h2
        className="mb-8 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Абонементы
      </motion.h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, y: 50, rotate: (i - 1.5) * 5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.5, delay: i * 0.12, type: 'spring' }}
          >
            <Card className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-light-text">{sub.name}</h3>
              <p className="text-2xl font-extrabold text-cosmic-accent">{sub.price}</p>
              <p className="text-sm leading-relaxed text-light-muted">{sub.description}</p>
              <p className="text-xs text-light-muted/80 border-t border-light-border pt-3">
                {sub.conditions}
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-2 self-start"
                onClick={scrollToHero}
              >
                Записаться
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  )
}

function SubscriptionScene2({ sorted }: { sorted: Subscription[] }) {
  return (
    <>
      <motion.h2
        className="mb-8 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Сравнение тарифов
      </motion.h2>
      <div className="flex flex-wrap justify-center gap-6">
        {sorted.map((sub, i) => (
          <motion.div
            key={sub.id}
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="w-64"
          >
            <Card className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-light-text">{sub.name}</h3>
              <p className="text-2xl font-extrabold text-cosmic-accent">{sub.price}</p>
              <p className="text-sm leading-relaxed text-light-muted">{sub.description}</p>
              <p className="text-xs text-light-muted/80 border-t border-light-border pt-3">
                {sub.conditions}
              </p>
              <Button
                variant="primary"
                size="md"
                className="mt-2 self-start"
                onClick={scrollToHero}
              >
                Записаться
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  )
}

function SubscriptionScene3() {
  return (
    <>
      <motion.h2
        className="mb-4 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Готовы начать?
      </motion.h2>
      <motion.p
        className="mb-6 text-lg text-light-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Пробное занятие — бесплатно
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Button variant="primary" size="lg" onClick={scrollToHero}>
          Записаться
        </Button>
      </motion.div>
    </>
  )
}

// --- Main section ---

export function SubscriptionsSection({ cms }: { cms: CmsData }) {
  const sorted = [...cms.subscriptions].sort((a, b) => a.sortOrder - b.sortOrder)
  const reduced = useReducedMotion()
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024
  const pinnedEnabled = isDesktop && !reduced

  if (!pinnedEnabled) {
    return (
      <Section id="subscriptions" variant="light">
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl">
          Абонементы
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sorted.map((sub, i) => (
            <SubscriptionCard key={sub.id} subscription={sub} index={i} />
          ))}
        </div>
      </Section>
    )
  }

  return <PinnedSubscriptions sorted={sorted} />
}

function PinnedSubscriptions({ sorted }: { sorted: Subscription[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  // Scene 1: [0, 0.05, 0.28, 0.33]
  const s1Opacity = useTransform(scrollYProgress, [0, 0.05, 0.28, 0.33], [0, 1, 1, 0])
  const s1Y = useTransform(scrollYProgress, [0, 0.05], [50, 0])

  // Scene 2: [0.30, 0.38, 0.61, 0.66]
  const s2Opacity = useTransform(scrollYProgress, [0.30, 0.38, 0.61, 0.66], [0, 1, 1, 0])
  const s2Y = useTransform(scrollYProgress, [0.30, 0.38], [50, 0])

  // Scene 3: [0.63, 0.71, 0.95, 1]
  const s3Opacity = useTransform(scrollYProgress, [0.63, 0.71, 0.95, 1], [0, 1, 1, 0])
  const s3Y = useTransform(scrollYProgress, [0.63, 0.71], [50, 0])

  return (
    <div ref={trackRef} style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <SceneWrapper opacity={s1Opacity} y={s1Y}>
          <SubscriptionScene1 sorted={sorted} />
        </SceneWrapper>
        <SceneWrapper opacity={s2Opacity} y={s2Y}>
          <SubscriptionScene2 sorted={sorted} />
        </SceneWrapper>
        <SceneWrapper opacity={s3Opacity} y={s3Y}>
          <SubscriptionScene3 />
        </SceneWrapper>
      </div>
    </div>
  )
}
