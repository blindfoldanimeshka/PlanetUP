import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { GroupCard } from '@/components/groups/GroupCard'
import { ScheduleTabs } from '@/components/groups/ScheduleTabs'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { HeartIcon } from 'lucide-animated'

export function KidsSection({ cms }: { cms: CmsData }) {
  const kidsGroups = cms.groups.filter((g) => g.category === 'kids')

  return (
    <Section id="kids">
      <SectionHeading id="kids" icon={HeartIcon}>Детям</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kidsGroups.map((group) => (
          <div key={group.id} data-stagger-card className="h-full">
            <GroupCard group={group} />
          </div>
        ))}
      </div>
      <div className="mt-12" data-stagger-card>
        <ScheduleTabs groups={kidsGroups} />
      </div>
    </Section>
  )
}