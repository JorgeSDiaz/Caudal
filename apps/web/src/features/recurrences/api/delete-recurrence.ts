import { api } from '@/api/client'

export async function deleteRecurrence(id: number): Promise<void> {
  const { error } = await api.DELETE('/api/v1/recurrences/{recurrence_id}', {
    params: { path: { recurrence_id: id } },
  })
  if (error) throw new Error('Failed to delete recurrence')
}
