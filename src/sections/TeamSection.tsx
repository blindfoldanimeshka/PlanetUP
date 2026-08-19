import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import type { CmsData, Trainer } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { UserCheckIcon } from 'lucide-animated'

/* ------------------------------------------------------------------ */
/*  Grid card (compact view)                                          */
/* ------------------------------------------------------------------ */

function GridCard({
  trainer,
  onClick,
}: {
  trainer: Trainer
  onClick: () => void
}) {
  return (
    <motion.div
      layout
      layoutId={`card-${trainer.id}`}
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-sm border border-min-border bg-min-surface transition-colors duration-300 hover:border-min-accent/50"
    >
      <motion.div layoutId={`photo-wrapper-${trainer.id}`} className="relative aspect-[3/4] overflow-hidden">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </motion.div>
      <div className="p-5 text-center">
        <motion.h3
          layoutId={`name-${trainer.id}`}
          className="font-display text-2xl font-bold text-min-text md:text-3xl"
        >
          {trainer.name}
        </motion.h3>
        <motion.p
          layoutId={`spec-${trainer.id}`}
          className="mt-1 text-xs font-medium uppercase tracking-widest text-min-accent"
        >
          {trainer.specialization}
        </motion.p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Expanded card (full detail view)                                  */
/* ------------------------------------------------------------------ */

function ExpandedCard({
  trainer,
  onClose,
}: {
  trainer: Trainer
  onClose: () => void
}) {
  return (
    <motion.div
      layout
      layoutId={`card-${trainer.id}`}
      className="relative w-full overflow-hidden rounded-sm"
    >
      {/* Photo with gradient overlay */}
      <motion.div layoutId={`photo-wrapper-${trainer.id}`} className="relative h-[50vh] min-h-[380px] max-h-[560px] w-full overflow-hidden">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
          aria-label="Закрыть"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        </button>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <motion.h3
            layoutId={`name-${trainer.id}`}
            className="font-display text-3xl font-bold text-white sm:text-4xl"
          >
            {trainer.name}
          </motion.h3>
          <motion.p
            layoutId={`spec-${trainer.id}`}
            className="mt-2 text-sm font-medium uppercase tracking-widest text-min-accent"
          >
            {trainer.specialization}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-4 max-w-2xl text-base leading-relaxed text-white/80"
          >
            {trainer.bio}
          </motion.p>
          {trainer.social && (
            <motion.a
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              href={trainer.social}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm font-medium text-min-accent transition-colors hover:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              Профиль тренера →
            </motion.a>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section                                                           */
/* ------------------------------------------------------------------ */

export function TeamSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  const visibleTrainers = cms.trainers.filter(
    (t) => !t.name.toLowerCase().includes('ташкова'),
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleClose = useCallback(() => setExpandedId(null), [])

  if (visibleTrainers.length === 0) return null

  const expandedTrainer = visibleTrainers.find((t) => t.id === expandedId)

  return (
    <Section id="team" variant={variant}>
      <SectionHeading id="team" icon={UserCheckIcon}>
        Наша команда
      </SectionHeading>
      <p className="mx-auto mb-12 max-w-2xl text-center text-base leading-relaxed text-min-muted">
        Наши педагоги — профессиональные тренеры с большим опытом. Они работают
        и с детьми, и со взрослыми: от первых шагов в акробатике до сложных
        парных постановок и выступлений. Каждый тренер «Планеты UP» помогает
        ученику раскрыть потенциал и полюбить движение.
      </p>

      <div className="mx-auto max-w-5xl">
        <AnimatePresence mode="popLayout">
          {expandedTrainer ? (
            <ExpandedCard
              key="expanded"
              trainer={expandedTrainer}
              onClose={handleClose}
            />
          ) : (
            <motion.div
              key="grid"
              className="grid gap-8 md:grid-cols-2 md:gap-10"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12 } },
              }}
            >
              {visibleTrainers.map((trainer) => (
                <motion.div
                  key={trainer.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
                  }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                >
                  <GridCard
                    trainer={trainer}
                    onClick={() => handleExpand(trainer.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Section>
  )
}
