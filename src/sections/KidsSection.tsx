import { useMemo } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { motion } from 'framer-motion'
import type { CmsData, Group, ScheduleItem, DayOfWeek } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const DAYS: DayOfWeek[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

function GroupCard({ group }: { group: Group }) {
  return (
    <Card
      variant="cosmic"
      className="flex flex-col overflow-hidden p-0"
    >
      <img
        src={group.photoUrl}
        alt={group.name}
        className="h-48 w-full object-cover"
        loading="lazy"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{group.name}</h3>
          <span className="inline-block mt-1 text-xs font-medium uppercase tracking-wide text-cosmic-accent-2/80">
            {group.level}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/70">{group.description}</p>
        <Button
          variant="primary"
          size="sm"
          className="mt-auto self-start"
          onClick={() => document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Записаться
        </Button>
      </div>
    </Card>
  )
}

function ScheduleTabs({ groups }: { groups: Group[] }) {
  const scheduleByDay = useMemo(() => {
    const map: Record<string, (ScheduleItem & { groupName: string })[]> = {}
    for (const g of groups) {
      for (const s of g.schedule) {
        if (!map[s.day]) map[s.day] = []
        map[s.day].push({ ...s, groupName: g.name })
      }
    }
    return map
  }, [groups])

  return (
    <Tabs.Root defaultValue="Пн" className="mt-10">
      <Tabs.List className="flex gap-1 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <Tabs.Trigger
            key={day}
            value={day}
            className="rounded-md px-4 py-2 text-sm font-medium transition-colors
              data-[state=active]:bg-cosmic-accent data-[state=active]:text-white
              text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-cosmic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cosmic-bg
              whitespace-nowrap"
          >
            {day}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {DAYS.map((day) => {
        const items = scheduleByDay[day] || []
        return (
          <Tabs.Content
            key={day}
            value={day}
            className="mt-4 rounded-lg border border-cosmic-accent/20 bg-cosmic-bg-deep/60 p-4
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-accent"
          >
            {items.length === 0 ? (
              <p className="text-sm text-white/50">Нет занятий в этот день</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.map((item, i) => (
                  <li
                    key={`${item.groupName}-${i}`}
                    className="flex items-center justify-between rounded-md bg-white/5 px-4 py-3"
                  >
                    <div>
                      <span className="text-sm font-semibold text-white">{item.time}</span>
                      <span className="ml-3 text-xs text-white/60">{item.note}</span>
                    </div>
                    <span className="text-xs text-cosmic-accent-2">{item.groupName}</span>
                  </li>
                ))}
              </ul>
            )}
          </Tabs.Content>
        )
      })}
    </Tabs.Root>
  )
}

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
