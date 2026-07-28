import { motion } from 'framer-motion'
import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { GroupCard } from '@/components/groups/GroupCard'
import { ScheduleTabs } from '@/components/groups/ScheduleTabs'

export function AdultsSection({ cms }: { cms: CmsData }) {
  const adultsGroups = cms.groups.filter((g) => g.category === 'adults')

  return (
    <Section id="adults">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-12 font-display text-center leading-tight tracking-tight text-min-text md:text-5xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
          Взрослым
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {adultsGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        <ScheduleTabs groups={adultsGroups} />
      </motion.div>
    </Section>
  )
}
