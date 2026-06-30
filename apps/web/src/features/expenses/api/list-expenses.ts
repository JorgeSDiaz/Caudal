import { api } from '@/api/client'
import type { ExpensePage } from '@/features/expenses/expense'

export async function listExpenses(month: string, limit: number): Promise<ExpensePage> {
  const { data, error } = await api.GET('/api/v1/expenses', {
    params: { query: { month, limit } },
  })
  if (error) throw new Error('Failed to load expenses')
  return data
}
