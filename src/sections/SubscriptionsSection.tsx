import { motion } from 'framer-motion'
import type { CmsData, Subscription } from '@/types/cms'
import { scrollToHero } from '@/lib/scroll'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function SubscriptionCard({ subscription, index }: { subscription: Subscription; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-light-text">{subscription.name}</h3>
        <p className="text-2xl font-extrabold text-cosmic-accent">{subscription.price}</p>
        <p className="text-sm leading-relaxed text-light-muted">{subscription.description}</p>
        <p className="text-xs text-light-muted/80 border-t border-light-border pt-3">
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
    <Section id="subscriptions" variant="light">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl">
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
