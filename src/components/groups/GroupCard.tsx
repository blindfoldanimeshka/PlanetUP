import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Group } from '@/types/cms'

function openBookingModal() {
  document.dispatchEvent(new CustomEvent('open-booking'))
}

export function GroupCard({ group }: { group: Group }) {
  return (
    <Card className="group flex flex-col overflow-hidden p-0">
      <div className="overflow-hidden">
        <img
          src={group.photoUrl}
          alt={group.name}
          className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-min-text">{group.name}</h3>
          <span className="mt-1 inline-block text-xs font-medium uppercase tracking-wide text-min-accent">
            {group.level}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-min-muted">{group.description}</p>
        <Button
          variant="primary"
          size="sm"
          className="mt-auto self-stretch"
          onClick={openBookingModal}
        >
          Записаться
        </Button>
      </div>
    </Card>
  )
}
