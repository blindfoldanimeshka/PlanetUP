import { scrollToHero } from '@/lib/scroll'
import type { CmsData, Subscription } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

function SubscriptionCard({ subscription, index }: { subscription: Subscription; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-min-text">{subscription.name}</h3>
        <p className="text-2xl font-extrabold text-min-accent">{subscription.price}</p>
        <p className="text-sm leading-relaxed text-min-muted">{subscription.description}</p>
        <p className="border-t border-min-border pt-3 text-xs text-min-muted">
          {subscription.conditions}
        </p>
        <Button
          variant="primary"
          size="md"
          className="mt-2 self-start"
          onClick={scrollToHero}
        >
          Записаться
        </Button>
      </Card>
    </motion.div>
  )
}

export function SubscriptionsSection({ cms }: { cms: CmsData }) {
  const sorted = [...cms.subscriptions].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Section id="subscriptions">
      <h2 className="mb-12 font-display text-center leading-tight tracking-tight text-min-text md:text-5xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
        Абонементы
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((sub, i) => (
          <SubscriptionCard key={sub.id} subscription={sub} index={i} />
        ))}
      </div>
    </Section>
  )
}
