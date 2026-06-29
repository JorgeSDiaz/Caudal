import type { Frequency } from '@/features/recurrences/recurrence'

/** Local form state for the recurrence config shown under the "repeat" checkbox. */
export type RecurrenceConfigValue = {
  recurring: boolean
  frequency: Frequency
  dayOfMonth: number
  secondDayOfMonth: number
  endDate: string // '' means no end
}

export const defaultRecurrenceConfig: RecurrenceConfigValue = {
  recurring: false,
  frequency: 'monthly',
  dayOfMonth: 1,
  secondDayOfMonth: 15,
  endDate: '',
}
