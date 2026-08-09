import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { GroupCard } from '@/components/groups/GroupCard'
import { ScheduleTabs } from '@/components/groups/ScheduleTabs'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { UsersIcon } from 'lucide-animated'

export function AdultsSection({ cms }: { cms: CmsData }) {
  const adultsGroups = cms.groups.filter((g) => g.category === 'adults')

  return (
    <Section id="adults">
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