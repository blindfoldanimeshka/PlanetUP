import * as Accordion from '@radix-ui/react-accordion'
import type { CmsData } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { CircleHelpIcon } from 'lucide-animated'
import { ChevronDownIcon } from '@/components/icons/chevron-down'

export function FaqSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  const sorted = [...cms.faq].sort((a, b) => a.sortOrder - b.sortOrder)
  if (sorted.length === 0) return null

  return (
    <Section id="faq" variant={variant}>
      <SectionHeading id="faq" icon={CircleHelpIcon}>{cms.texts.headings.faq}</SectionHeading>
      <div className="mx-auto max-w-3xl">
        <Accordion.Root type="single" collapsible className="flex flex-col gap-3">
          {sorted.map((item) => (
            <div key={item.id} data-stagger-card className="h-full">
              <Card className="overflow-hidden">
                <Accordion.Item value={item.id}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="group flex w-full items-center justify-between gap-4 px-5 py-4
                        text-left text-sm font-semibold text-min-text transition-colors
                        hover:text-min-accent focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-min-accent focus-visible:ring-inset"
                    >
                      <span>{item.question}</span>
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
                      {item.answer}
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