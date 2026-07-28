import { motion } from 'framer-motion'
import * as Accordion from '@radix-ui/react-accordion'
import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

export function FaqSection({ cms }: { cms: CmsData }) {
  const sorted = [...cms.faq].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Section id="faq">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-12 font-display text-center leading-tight tracking-tight text-min-text md:text-5xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
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
                        text-left text-sm font-semibold text-min-text transition-colors
                        hover:text-min-accent focus-visible:outline-none focus-visible:ring-2
                        focus-visible:ring-min-accent focus-visible:ring-inset"
                    >
                      <span>{item.question}</span>
                      <span
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-sm
                          border border-min-border text-xs text-min-muted transition-transform
                          duration-200 group-data-[state=open]:rotate-45 group-data-[state=open]:border-min-accent"
                        aria-hidden="true"
                      >
                        +
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
            ))}
          </Accordion.Root>
        </div>
      </motion.div>
    </Section>
  )
}
