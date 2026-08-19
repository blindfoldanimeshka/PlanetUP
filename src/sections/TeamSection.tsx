import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import type { CmsData, Trainer } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { UserCheckIcon } from 'lucide-animated'

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

const cardEnter = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const cardExit = { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }

/* ------------------------------------------------------------------ */
/*  Compact card (grid view) — matches reference pattern               */
/* ------------------------------------------------------------------ */

function CompactCard({
  trainer,
  onClick,
}: {
  trainer: Trainer
  onClick: () => void
}) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-lg bg-min-surface shadow-sm transition-shadow duration-300 hover:shadow-md"
    >
      {/* Photo with fixed height + gradient overlay */}
      <div className="relative h-120 overflow-hidden">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Name + specialization — absolute at bottom of card */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-left text-white">
        <h3 className="font-display text-2xl font-bold">{trainer.name}</h3>
        <p className="mt-1 text-sm font-medium uppercase tracking-widest text-min-accent">
          {trainer.specialization}
        </p>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Expanded card — photo + gradient + name over photo + bio below     */
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
      className="relative overflow-hidden rounded-lg bg-min-surface shadow-lg"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Photo — same height as compact for shared-layout feel */}
      <div className="relative h-120 overflow-hidden">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
          aria-label="Закрыть"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Name + specialization — absolute at bottom of photo */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-left text-white sm:p-8 lg:p-12">
          <h3 className="font-display text-3xl font-bold sm:text-4xl">
            {trainer.name}
          </h3>
          <p className="mt-2 text-sm font-medium uppercase tracking-widest text-min-accent">
            {trainer.specialization}
          </p>
        </div>
      </div>

      {/* Bio + social — below photo in normal flow, staggered entrance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="p-6 font-sans text-base leading-relaxed text-white/80 sm:p-8 lg:p-12"
      >
        <p>{trainer.bio}</p>
        {trainer.social && (
          <a
            href={trainer.social}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm font-medium text-min-accent transition duration-200 hover:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            Профиль тренера →
          </a>
        )}
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
        <AnimatePresence mode="wait">
          {expandedTrainer ? (
            /* ── Expanded: single card, full width ──────────────────── */
            <motion.div
              key={`expanded-${expandedTrainer.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ExpandedCard trainer={expandedTrainer} onClose={handleClose} />
            </motion.div>
          ) : (
            /* ── Grid: compact cards with stagger ───────────────────── */
            <motion.div
              key="grid"
              className="grid grid-cols-1 gap-8 md:grid-cols-2"
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              {visibleTrainers.map((trainer) => (
                <motion.div
                  key={trainer.id}
                  variants={cardEnter}
                  exit={cardExit}
                >
                  <CompactCard
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
