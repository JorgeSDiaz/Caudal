import { api } from '@/api/client'

export async function deleteExpense(id: number): Promise<void> {
  const { error } = await api.DELETE('/api/v1/expenses/{expense_id}', {
    params: { path: { expense_id: id } },
  })
  if (error) throw new Error('Failed to delete expense')
}
