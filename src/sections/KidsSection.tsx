import type { CmsData } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { GroupCard } from '@/components/groups/GroupCard'
import { ScheduleTabs } from '@/components/groups/ScheduleTabs'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { HeartIcon } from 'lucide-animated'

export function KidsSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  const kidsGroups = cms.groups.filter((g) => g.category === 'kids')
  if (kidsGroups.length === 0) return null

  return (
    <Section id="kids" variant={variant}>
      <SectionHeading id="kids" icon={HeartIcon}>{cms.texts.headings.kids}</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {kidsGroups.map((group) => (
          <div key={group.id} data-stagger-card className="h-full">
            <GroupCard group={group} ctaLabel={cms.texts.booking.submitButton} />
          </div>
        ))}
      </div>
      <div className="mt-12" data-stagger-card>
        <ScheduleTabs groups={kidsGroups} emptyText={cms.texts.scheduleEmptyDay} />
      </div>
    </Section>
  )
}