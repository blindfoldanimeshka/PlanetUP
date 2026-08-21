import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { SparklesIcon } from 'lucide-animated'

const FEATURES = [
  {
    title: 'Квалифицированные педагоги',
    text: 'Опытные наставники помогают раскрыть потенциал и полюбить движение.',
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
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            data-stagger-card
            className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/8 p-6 backdrop-blur-md transition-all duration-300 hover:border-white/25 hover:bg-white/12 hover:shadow-[0_8px_32px_rgba(168,85,247,0.08)]"
          >
            <h3 className="font-display text-lg font-bold text-min-text">
              {f.title}
            </h3>
            <p className="text-sm leading-relaxed text-min-muted">{f.text}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
