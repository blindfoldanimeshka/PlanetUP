import { useRef } from 'react'
import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion'
import type { CmsData, Trainer } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { useReducedMotion } from '@/hooks/useReducedMotion'

function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  })

  const amplitude = 0.8 + index * 0.1
  const photoY = useTransform(scrollYProgress, [0, 1], [0, -20 * amplitude])
  const photoScale = useTransform(scrollYProgress, [0, 1], [0.85, 1])
  const textX = useTransform(scrollYProgress, [0, 1], [-20, 0])
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.8], [0, 1])

  if (reduced) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        <Card className="flex flex-col items-center gap-4 text-center p-6">
          <img
            src={trainer.photoUrl}
            alt={trainer.name}
            className="h-32 w-32 rounded-full object-cover ring-2 ring-cosmic-accent/20"
            loading="lazy"
          />
          <div>
            <h3 className="text-lg font-semibold text-white">{trainer.name}</h3>
            <p className="text-sm font-medium text-cosmic-accent-2">{trainer.specialization}</p>
          </div>
          <p className="text-sm leading-relaxed text-white/70">{trainer.bio}</p>
          {trainer.social && (
            <a
              href={trainer.social}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-cosmic-accent transition-colors hover:text-cosmic-accent-2"
            >
              Профиль тренера →
            </a>
          )}
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="flex flex-col items-center gap-4 text-center p-6">
        <motion.img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-32 w-32 rounded-full object-cover ring-2 ring-cosmic-accent/20"
          style={{ y: photoY, scale: photoScale }}
          loading="lazy"
        />
        <motion.div style={{ x: textX, opacity: textOpacity }}>
          <h3 className="text-lg font-semibold text-white">{trainer.name}</h3>
          <p className="text-sm font-medium text-cosmic-accent-2">{trainer.specialization}</p>
        </motion.div>
        <motion.p
          className="text-sm leading-relaxed text-white/70"
          style={{ x: textX, opacity: textOpacity }}
        >
          {trainer.bio}
        </motion.p>
        {trainer.social && (
          <motion.a
            href={trainer.social}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-cosmic-accent transition-colors hover:text-cosmic-accent-2"
            style={{ opacity: textOpacity }}
          >
            Профиль тренера →
          </motion.a>
        )}
      </Card>
    </motion.div>
  )
}

export function TeamSection({ cms }: { cms: CmsData }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const orbY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const orbScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 0.8])
  const orbOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.3, 0.3, 0])

  return (
    <div ref={sectionRef}>
      <Section id="team" variant="cosmic" className="relative overflow-hidden">
      {/* Parallax cosmic orb */}
      {!reduced && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-0"
          style={{ y: orbY }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ scale: orbScale, opacity: orbOpacity }}
          >
            <div className="h-96 w-96 rounded-full bg-cosmic-accent/10 blur-3xl md:h-[32rem] md:w-[32rem]" />
          </motion.div>
        </motion.div>
      )}

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          Наша команда
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cms.trainers.map((trainer, i) => (
            <TrainerCard key={trainer.id} trainer={trainer} index={i} />
          ))}
        </div>
      </motion.div>
      </Section>
    </div>
  )
}
