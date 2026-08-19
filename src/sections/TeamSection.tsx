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
      {/* Photo — name lives INSIDE this relative wrapper so absolute works */}
      <div className="relative h-72 sm:h-96 md:h-120 overflow-hidden">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Name + specialization — black plaques at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-start gap-1.5 p-3 sm:p-4">
          <span className="inline-block rounded bg-black/70 px-3 py-1 font-display text-sm font-bold text-white backdrop-blur-sm sm:text-lg">
            {trainer.name}
          </span>
          <span className="inline-block rounded bg-min-accent/80 px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm sm:text-xs">
            {trainer.specialization}
          </span>
        </div>
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
      {/* Photo — responsive height, name lives inside */}
      <div className="relative h-72 sm:h-96 md:h-120 overflow-hidden">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white sm:right-4 sm:top-4 sm:h-10 sm:w-10"
          aria-label="Закрыть"
        >
          <svg
            className="h-4 w-4 sm:h-5 sm:w-5"
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

        {/* Name + specialization — black plaques at bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-start gap-1.5 p-3 sm:p-4">
          <span className="inline-block rounded bg-black/70 px-3 py-1 font-display text-sm font-bold text-white backdrop-blur-sm sm:text-lg lg:text-xl">
            {trainer.name}
          </span>
          <span className="inline-block rounded bg-min-accent/80 px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm sm:text-xs">
            {trainer.specialization}
          </span>
        </div>
      </div>

      {/* Bio + social — below photo in normal flow, staggered entrance */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="p-4 font-sans text-sm leading-relaxed text-white/80 sm:p-6 sm:text-base lg:p-8"
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
