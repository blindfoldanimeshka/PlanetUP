import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { SparklesIcon } from 'lucide-animated'

const FEATURES = [
  {
    title: 'Физическое развитие',
    text: 'Комфортное и безопасное обучение для каждого.',
  },
  {
    title: 'Тренеры-профи',
    text: 'Практикующие спортсмены с опытом работы с детьми и взрослыми любого уровня.',
  },
  {
    title: 'Любительские и профессиональные группы',
    text: 'Тренируйтесь для себя или готовьтесь к выступлениям — для каждого найдётся группа.',
  },
  {
    title: 'Группы от 3 до +18 лет',
    text: 'Занимаемся с детьми от 3 лет и со взрослыми без верхней границы возраста.',
  },
]

export function FeaturesSection({ variant }: { variant?: SectionVariant } = {}) {
  return (
    <Section id="features" variant={variant}>
      <SectionHeading id="features" icon={SparklesIcon}>
        Наши особенности
      </SectionHeading>
      <ol className="mx-auto flex max-w-3xl flex-col gap-5">
        {FEATURES.map((f, i) => (
          <li key={f.title} data-stagger-card className="flex items-start gap-4">
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
