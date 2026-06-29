import { api } from '@/api/client'

/** Materialize every recurrence occurrence that has come due; returns how many. */
export async function runRecurrences(): Promise<number> {
  const { data, error } = await api.POST('/api/v1/recurrences/run', {})
  if (error) throw new Error('Failed to run recurrences')
  return data.generated ?? 0
}
