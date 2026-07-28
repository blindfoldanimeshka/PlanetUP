import { useMemo } from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import type { DayOfWeek, Group, ScheduleItem } from '@/types/cms'

const DAYS: DayOfWeek[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function ScheduleTabs({ groups }: { groups: Group[] }) {
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
      <Tabs.List className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
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
