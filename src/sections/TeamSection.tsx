import type { CmsData, Trainer } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { UserCheckIcon } from 'lucide-animated'

function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <div data-stagger-card className="h-full">
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
        <p className="flex-1 text-sm leading-relaxed text-min-muted">{trainer.bio}</p>
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
    </div>
  )
}

export function TeamSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="team">
      <SectionHeading id="team" icon={UserCheckIcon}>Наша команда</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cms.trainers.map((trainer) => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </div>
    </Section>
  )
}