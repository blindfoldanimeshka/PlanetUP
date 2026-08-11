import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as Tabs from '@radix-ui/react-tabs'
import type { DayOfWeek, Group, ScheduleItem } from '@/types/cms'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const DAYS: DayOfWeek[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function ScheduleTabs({ groups }: { groups: Group[] }) {
  const reduced = useReducedMotion()
  const [activeDay, setActiveDay] = useState<string>('Пн')

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

  const items = scheduleByDay[activeDay] || []

  const transition = reduced
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as const }

  return (
    <Tabs.Root defaultValue="Пн" onValueChange={setActiveDay} className="mt-10">
      <div className="glass-surface rounded-2xl">
        <Tabs.List className="flex gap-1 overflow-x-auto p-2">
          {DAYS.map((day) => (
            <Tabs.Trigger
              key={day}
              value={day}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all
                data-[state=active]:glass-input data-[state=active]:text-min-accent
                text-min-muted hover:text-min-text focus-visible:outline-none focus-visible:ring-2
                focus-visible:ring-min-accent whitespace-nowrap"
            >
              {day}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </div>

      <div className="relative mt-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={transition}
          >
            <div className="glass-surface rounded-2xl">
              <div className="p-4">
                {items.length === 0 ? (
                  <p className="text-sm text-min-muted">Нет занятий в этот день</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {items.map((item, i) => (
                      <li
                        key={`${item.groupName}-${i}`}
                        className="flex items-center justify-between glass-input rounded-xl px-4 py-3"
                      >
                        <div>
                          <span className="text-sm font-semibold text-min-text">{item.time}</span>
                          <span className="ml-3 text-xs text-min-muted">{item.note}</span>
                        </div>
                        <span className="text-xs text-min-accent">{item.groupName}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Tabs.Root>
  )
}
