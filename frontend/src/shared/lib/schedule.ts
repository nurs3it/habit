import { format } from 'date-fns'

export type HabitSchedule =
  | { mode: 'all_time' }
  | { mode: 'date_range'; start?: string; end?: string }
  | { mode: 'weekdays'; start?: string; days?: number[] }
  | { mode: 'specific_dates'; start?: string; dates?: string[] }
  | { mode: 'days_21'; start?: string; end?: string }

export function isHabitScheduledOn(schedule: unknown, day: Date): boolean {
  const s = (schedule && typeof schedule === 'object' ? (schedule as any) : null) as HabitSchedule | null
  const mode = (s?.mode || 'all_time') as HabitSchedule['mode'] | string
  const dayStr = format(day, 'yyyy-MM-dd')

  if (!s || mode === 'all_time') return true

  const start = typeof (s as any).start === 'string' ? ((s as any).start as string) : undefined
  if (start && dayStr < start) return false

  if (mode === 'date_range' || mode === 'days_21') {
    const end = typeof (s as any).end === 'string' ? ((s as any).end as string) : undefined
    if (end && dayStr > end) return false
    return true
  }

  if (mode === 'weekdays') {
    const days = Array.isArray((s as any).days) ? ((s as any).days as unknown[]) : []
    const set = new Set(days.map((x) => Number(x)).filter((n) => Number.isFinite(n)))
    const iso = ((day.getDay() + 6) % 7) + 1
    return set.has(iso)
  }

  if (mode === 'specific_dates') {
    const dates = Array.isArray((s as any).dates) ? ((s as any).dates as unknown[]) : []
    const set = new Set(dates.filter((x): x is string => typeof x === 'string'))
    return set.has(dayStr)
  }

  return true
}

