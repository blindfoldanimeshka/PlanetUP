import type { CmsData, Subscription } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { CheckIcon } from '@/components/icons/check'
import { CreditCardIcon } from 'lucide-animated'

function openBookingModal() {
  document.dispatchEvent(new CustomEvent('open-booking'))
}

function SubscriptionCard({ subscription }: { subscription: Subscription }) {
  return (
    <div data-stagger-card className="h-full">
      <Card className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-min-text">{subscription.name}</h3>
        <p className="text-2xl font-extrabold text-min-accent">{subscription.price}</p>
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <CheckIcon className="mt-0.5 flex-shrink-0 text-min-accent" size={16} />
            <p className="text-sm leading-relaxed text-min-muted">{subscription.description}</p>
          </div>
          <p className="border-t border-min-border pt-3 text-xs text-min-muted">
            {subscription.conditions}
          </p>
        </div>
        <Button
          variant="primary"
          size="md"
          className="self-stretch mt-4"
          onClick={openBookingModal}
        >
          Записаться
        </Button>
      </Card>
    </div>
  )
}

export function SubscriptionsSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  const sorted = [...cms.subscriptions].sort((a, b) => a.sortOrder - b.sortOrder)
  if (sorted.length === 0) return null

  return (
    <Section id="subscriptions" variant={variant}>
      <SectionHeading id="subscriptions" icon={CreditCardIcon}>Цены</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {sorted.map((sub) => (
          <SubscriptionCard key={sub.id} subscription={sub} />
        ))}
      </div>
    </Section>
  )
}