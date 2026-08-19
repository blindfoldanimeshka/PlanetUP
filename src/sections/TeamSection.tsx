import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

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

/* ------------------------------------------------------------------ */
/*  Single card — renders compact or expanded based on isExpanded      */
/*  Uses `layout` for seamless morphing between states.               */
/* ------------------------------------------------------------------ */

function TrainerCard({
  trainer,
  isExpanded,
  onClose,
  onExpand,
}: {
  trainer: Trainer
  isExpanded: boolean
  onClose: () => void
  onExpand: () => void
}) {
  return (
    <motion.div
      layout
      onClick={!isExpanded ? onExpand : undefined}
      className={
        isExpanded
          ? 'col-span-full overflow-hidden rounded-lg bg-min-surface shadow-lg'
          : 'cursor-pointer overflow-hidden rounded-lg bg-min-surface shadow-sm transition-shadow duration-300 hover:shadow-md'
      }
      style={{ zIndex: isExpanded ? 10 : 1 }}
    >
      <div className="flex flex-col sm:flex-row">
        {/* ── Photo ──────────────────────────────────────────────── */}
        <motion.div
          layout
          className="relative shrink-0 overflow-hidden"
          style={{
            /* compact: full-width 3:4 portrait; expanded: fixed 40% width */
            aspectRatio: isExpanded ? undefined : '3 / 4',
            width: isExpanded ? '40%' : '100%',
          }}
        >
          <img
            src={trainer.photoUrl}
            alt={trainer.name}
            className="h-full w-full object-cover object-top"
            loading={isExpanded ? undefined : 'lazy'}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

          {/* Close button — expanded only */}
          {isExpanded && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white sm:right-4 sm:top-4 sm:h-10 sm:w-10"
              aria-label="Закрыть"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}

          {/* Name + specialization — black plaques at bottom */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-start gap-1.5 p-3 sm:p-4">
            <span className="inline-block rounded bg-black/70 px-3 py-1 font-display text-sm font-bold text-white backdrop-blur-sm sm:text-lg">
              {trainer.name}
            </span>
            <span className="inline-block rounded bg-min-accent/80 px-3 py-1 font-sans text-[10px] font-medium uppercase tracking-widest text-white backdrop-blur-sm sm:text-xs">
              {trainer.specialization}
            </span>
          </div>
        </motion.div>

        {/* ── Info panel — expanded only ─────────────────────────── */}
        <motion.div
          layout
          className="flex flex-1 flex-col justify-center overflow-hidden p-4 font-sans text-sm leading-relaxed text-white/80 sm:p-6 sm:text-base lg:p-8"
          initial={false}
          animate={{
            opacity: isExpanded ? 1 : 0,
            width: isExpanded ? 'auto' : 0,
            padding: isExpanded ? undefined : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
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
      </div>
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
        {/* Always render ALL cards — layout prop handles morphing */}
        <motion.div
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {visibleTrainers.map((trainer) => (
            <motion.div key={trainer.id} variants={cardEnter}>
              <TrainerCard
                trainer={trainer}
                isExpanded={expandedId === trainer.id}
                onClose={handleClose}
                onExpand={() => handleExpand(trainer.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </Section>
  )
}
