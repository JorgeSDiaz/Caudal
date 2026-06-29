import { api } from '@/api/client'
import type { Recurrence, RecurrenceKind } from '@/features/recurrences/recurrence'

export async function listRecurrences(kind: RecurrenceKind): Promise<Recurrence[]> {
  const { data, error } = await api.GET('/api/v1/recurrences', {
    params: { query: { kind } },
  })
  if (error) throw new Error('Failed to load recurrences')
  return data
}
