import type { Recurrence } from '@/features/recurrences/recurrence'

const dayFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

/** Human description of a recurrence's schedule, e.g. "Mensual · día 15". */
export function describeSchedule(recurrence: Recurrence): string {
  if (recurrence.frequency === 'biweekly' && recurrence.second_day_of_month !== null) {
    const [a, b] = [recurrence.day_of_month, recurrence.second_day_of_month].sort((x, y) => x - y)
    return `Quincenal · días ${a} y ${b}`
  }
  return `Mensual · día ${recurrence.day_of_month}`
}

/** Formats an ISO date (YYYY-MM-DD) as a short day label, e.g. "15 jul". */
export function formatShortDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dayFormatter.format(new Date(year, month - 1, day))
}
