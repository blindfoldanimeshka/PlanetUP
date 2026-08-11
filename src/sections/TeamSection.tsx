import type { CmsData, Trainer } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { UserCheckIcon } from 'lucide-animated'

function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <div data-stagger-card className="group flex flex-col gap-5">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-[320px] overflow-hidden rounded-sm bg-min-surface">
        <img
          src={trainer.photoUrl}
          alt={trainer.name}
          className="h-full w-full object-cover object-top transition-all duration-500 group-hover:scale-[1.02]"
          loading="lazy"
        />
      </div>
      <div className="text-center">
        <h3 className="font-display text-2xl font-bold text-min-text md:text-3xl">
          {trainer.name}
        </h3>
        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-min-accent">
          {trainer.specialization}
        </p>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-min-muted line-clamp-2">
          {trainer.bio}
        </p>
        {trainer.social && (
          <a
            href={trainer.social}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block text-sm text-min-accent transition-colors hover:text-min-text"
          >
            Профиль тренера →
          </a>
        )}
      </div>
    </div>
  )
}

export function TeamSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="team">
      <SectionHeading id="team" icon={UserCheckIcon}>
        Наша команда
      </SectionHeading>
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2 md:gap-12">
        {cms.trainers.map((trainer) => (
          <TrainerCard key={trainer.id} trainer={trainer} />
        ))}
      </div>
    </Section>
  )
}
