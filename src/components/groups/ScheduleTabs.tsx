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
      <Tabs.List className="neu-raised rounded-2xl flex gap-1 overflow-x-auto p-2">
        {DAYS.map((day) => (
          <Tabs.Trigger
            key={day}
            value={day}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all
              data-[state=active]:neu-pressed data-[state=active]:text-min-accent
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
            className="mt-4 neu-raised rounded-2xl p-4
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-min-accent"
          >
            {items.length === 0 ? (
              <p className="text-sm text-min-muted">Нет занятий в этот день</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.map((item, i) => (
                  <li
                    key={`${item.groupName}-${i}`}
                    className="flex items-center justify-between neu-pressed-sm rounded-xl px-4 py-3"
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
