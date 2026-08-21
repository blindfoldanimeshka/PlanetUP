import * as Accordion from '@radix-ui/react-accordion'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { SparklesIcon } from 'lucide-animated'
import { ChevronDownIcon } from '@/components/icons/chevron-down'

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

const ITEM_VALUES = FEATURES.map((_, i) => `feature-${i}`)

export function FeaturesSection({ variant }: { variant?: SectionVariant } = {}) {
  return (
    <Section id="features" variant={variant}>
      <SectionHeading id="features" icon={SparklesIcon}>
        Наши особенности
      </SectionHeading>
      <div className="mx-auto max-w-3xl">
        <Accordion.Root
          type="multiple"
          defaultValue={ITEM_VALUES}
          className="flex flex-col gap-3"
        >
          {FEATURES.map((f, i) => (
            <div key={f.title} data-stagger-card className="h-full">
              <Card className="overflow-hidden">
                <Accordion.Item value={ITEM_VALUES[i]}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="group flex w-full items-center justify-between gap-4 px-5 py-4
                        text-left text-sm font-semibold text-min-text transition-colors
                        hover:text-min-accent focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-min-accent focus-visible:ring-inset"
                    >
                      <span>{f.title}</span>
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full
                          glass-input text-min-muted transition-all duration-300
                          group-data-[state=open]:text-min-accent group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      >
                        <ChevronDownIcon className="size-4" size={16} />
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content
                    className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                  >
                    <div className="px-5 pb-4 text-sm leading-relaxed text-min-muted">
                      {f.text}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Card>
            </div>
          ))}
        </Accordion.Root>
      </div>
    </Section>
  )
}
