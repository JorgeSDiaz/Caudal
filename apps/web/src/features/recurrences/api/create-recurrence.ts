import { api } from '@/api/client'
import type { CreateRecurrenceInput, Recurrence } from '@/features/recurrences/recurrence'

export async function createRecurrence(input: CreateRecurrenceInput): Promise<Recurrence> {
  const { data, error } = await api.POST('/api/v1/recurrences', { body: input })
  if (error) throw new Error('Failed to create recurrence')
  return data
}
