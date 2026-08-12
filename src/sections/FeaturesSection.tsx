import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { SparklesIcon } from 'lucide-animated'

const FEATURES = [
  {
    title: 'Пробное бесплатно',
    text: 'Первое занятие — бесплатно. Без обязательств: просто приходите и попробуйте.',
  },
  {
    title: 'Тренеры-профи',
    text: 'Практикующие спортсмены с опытом работы с детьми и взрослыми любого уровня.',
  },
  {
    title: 'Воздушная акробатика',
    text: 'Уникальные направления: акро-гимнастика, растяжка и постановки под музыку.',
  },
  {
    title: 'Группы 4–16+',
    text: 'Занимаемся с детьми от 4 лет и со взрослыми без верхней границы возраста.',
  },
]

export function FeaturesSection() {
  return (
    <Section id="features">
      <SectionHeading id="features" icon={SparklesIcon}>
        Наши особенности
      </SectionHeading>
      <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            data-stagger-card
            className="flex flex-col gap-3 rounded-2xl border border-white/15 bg-white/8 p-6 backdrop-blur-md"
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
