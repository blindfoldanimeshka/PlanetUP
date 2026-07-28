import { motion } from 'framer-motion'
import * as Accordion from '@radix-ui/react-accordion'
import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

export function FaqSection({ cms }: { cms: CmsData }) {
  const sorted = [...cms.faq].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Section id="faq" variant="light">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl">
          Часто задаваемые вопросы
        </h2>

        <div className="mx-auto max-w-3xl">
          <Accordion.Root type="single" collapsible className="flex flex-col gap-3">
            {sorted.map((item) => (
              <Card key={item.id} className="p-0 overflow-hidden">
                <Accordion.Item value={item.id}>
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="group flex w-full items-center justify-between gap-4 px-5 py-4
                        text-left text-sm font-semibold text-light-text transition-colors
                        hover:text-cosmic-accent focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-cosmic-accent focus-visible:ring-inset"
                    >
                      <span>{item.question}</span>
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full
                          border border-light-border text-xs text-light-muted transition-transform
                          duration-200 group-data-[state=open]:rotate-45 group-data-[state=open]:border-cosmic-accent"
                        aria-hidden="true"
                      >
                        +
                      </span>
                    </Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Content
                    className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
                  >
                    <div className="px-5 pb-4 text-sm leading-relaxed text-light-muted">
                      {item.answer}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              </Card>
            ))}
          </Accordion.Root>
        </div>
      </motion.div>
    </Section>
  )
}
