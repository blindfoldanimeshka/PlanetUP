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
      <Tabs.List className="flex gap-1 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <Tabs.Trigger
            key={day}
            value={day}
            className="rounded-sm px-4 py-2 text-sm font-medium transition-colors
              data-[state=active]:bg-min-accent data-[state=active]:text-white
              text-min-muted hover:text-min-text focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-min-accent whitespace-nowrap"
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
            className="mt-4 rounded-sm border border-min-border bg-min-surface p-4
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-min-accent"
          >
            {items.length === 0 ? (
              <p className="text-sm text-min-muted">Нет занятий в этот день</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.map((item, i) => (
                  <li
                    key={`${item.groupName}-${i}`}
                    className="flex items-center justify-between rounded-sm bg-min-bg px-4 py-3"
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
          </Tabs.Content>
        )
      })}
    </Tabs.Root>
  )
}
