import type { CmsData } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { GroupCard } from '@/components/groups/GroupCard'
import { ScheduleTabs } from '@/components/groups/ScheduleTabs'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { UsersIcon } from 'lucide-animated'

export function AdultsSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  const adultsGroups = cms.groups.filter((g) => g.category === 'adults')
  if (adultsGroups.length === 0) return null

  return (
    <Section id="adults" variant={variant}>
      <SectionHeading id="adults" icon={UsersIcon}>Взрослым</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {adultsGroups.map((group) => (
          <div key={group.id} data-stagger-card className="h-full">
            <GroupCard group={group} />
          </div>
        ))}
      </div>
      <div className="mt-12" data-stagger-card>
        <ScheduleTabs groups={adultsGroups} />
      </div>
    </Section>
  )
}