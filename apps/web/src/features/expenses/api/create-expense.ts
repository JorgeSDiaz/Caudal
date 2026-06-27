import { api } from '@/api/client'
import type { CreateExpenseInput, Expense } from '@/features/expenses/expense'

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data, error } = await api.POST('/api/v1/expenses', { body: input })
  if (error) throw new Error('Failed to create expense')
  return data
}
