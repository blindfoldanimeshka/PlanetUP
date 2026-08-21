import type { CmsData } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { SparklesIcon } from 'lucide-animated'

export function FeaturesSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  if (cms.features.length === 0) return null
  return (
    <Section id="features" variant={variant}>
      <SectionHeading id="features" icon={SparklesIcon}>
        {cms.texts.headings.features}
      </SectionHeading>
      <ol className="mx-auto flex max-w-3xl flex-col gap-5">
        {cms.features.map((f, i) => (
          <li key={f.id} data-stagger-card className="flex items-start gap-4">
            <span
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full
                border border-min-accent/40 bg-min-accent/10 text-sm font-bold text-min-accent"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-min-text">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-min-muted">{f.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
