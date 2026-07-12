import { api } from '@/api/client'
import type { Recurrence, UpdateRecurrenceInput } from '@/features/recurrences/recurrence'

export async function updateRecurrence(
  id: number,
  input: UpdateRecurrenceInput,
): Promise<Recurrence> {
  const { data, error } = await api.PATCH('/api/v1/recurrences/{recurrence_id}', {
    params: { path: { recurrence_id: id } },
    body: input,
  })
  if (error) throw new Error('Failed to update recurrence')
  return data
}
