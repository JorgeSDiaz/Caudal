import { api } from '@/api/client'

export async function deleteIncome(id: number): Promise<void> {
  const { error } = await api.DELETE('/api/v1/incomes/{income_id}', {
    params: { path: { income_id: id } },
  })
  if (error) throw new Error('Failed to delete income')
}
