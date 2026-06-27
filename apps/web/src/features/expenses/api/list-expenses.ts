import { api } from '@/api/client'
import type { Expense } from '@/features/expenses/expense'

export async function listExpenses(month: string): Promise<Expense[]> {
  const { data, error } = await api.GET('/api/v1/expenses', {
    params: { query: { month } },
  })
  if (error) throw new Error('Failed to load expenses')
  return data
}
