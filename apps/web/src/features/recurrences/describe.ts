import type { Recurrence } from '@/features/recurrences/recurrence'

const dayFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

/** Human description of a recurrence's schedule, e.g. "Mensual · día 15". */
export function describeSchedule(recurrence: Recurrence): string {
  if (recurrence.frequency === 'biweekly') {
    return `Quincenal · cada 15 días desde ${formatShortDay(recurrence.start_date)}`
  }
  return `Mensual · día ${recurrence.day_of_month}`
}

/** Formats an ISO date (YYYY-MM-DD) as a short day label, e.g. "15 jul". */
export function formatShortDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dayFormatter.format(new Date(year, month - 1, day))
}
