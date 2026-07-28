import { motion } from 'framer-motion'
import type { CmsData, Trainer } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="flex flex-col items-center gap-4 p-6 text-center">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-32 w-32 rounded-full object-cover ring-2 ring-min-border"
          loading="lazy"
        />
        <div>
          <h3 className="text-lg font-semibold text-min-text">{trainer.name}</h3>
          <p className="text-sm font-medium text-min-accent">{trainer.specialization}</p>
        </div>
        <p className="text-sm leading-relaxed text-min-muted">{trainer.bio}</p>
        {trainer.social && (
          <a
            href={trainer.social}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-min-accent transition-colors hover:text-min-text"
          >
            Профиль тренера →
          </a>
        )}
      </Card>
    </motion.div>
  )
}

export function TeamSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="team">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-12 font-display text-center leading-tight tracking-tight text-min-text md:text-5xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
          Наша команда
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cms.trainers.map((trainer, i) => (
            <TrainerCard key={trainer.id} trainer={trainer} index={i} />
          ))}
        </div>
      </motion.div>
    </Section>
  )
}
