import { motion } from 'framer-motion'
import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { GroupCard } from '@/components/groups/GroupCard'
import { ScheduleTabs } from '@/components/groups/ScheduleTabs'

export function KidsSection({ cms }: { cms: CmsData }) {
  const kidsGroups = cms.groups.filter((g) => g.category === 'kids')

  return (
    <Section id="kids" variant="cosmic">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          Детям
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {kidsGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        <ScheduleTabs groups={kidsGroups} />
      </motion.div>
    </Section>
  )
}
