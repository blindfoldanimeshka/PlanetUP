import { motion } from 'framer-motion'
import type { CmsData, Trainer } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
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

export function TeamSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="team" variant="cosmic">
      <motion.div
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
  )
}
