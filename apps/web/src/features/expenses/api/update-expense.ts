import { api } from '@/api/client'
import type { Expense, UpdateExpenseInput } from '@/features/expenses/expense'

export async function updateExpense(id: number, input: UpdateExpenseInput): Promise<Expense> {
  const { data, error } = await api.PATCH('/api/v1/expenses/{expense_id}', {
    params: { path: { expense_id: id } },
    body: input,
  })
  if (error) throw new Error('Failed to update expense')
  return data
}
