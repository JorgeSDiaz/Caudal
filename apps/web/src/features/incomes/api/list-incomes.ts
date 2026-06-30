import { api } from '@/api/client'
import type { IncomePage } from '@/features/incomes/income'

export async function listIncomes(month: string, limit: number): Promise<IncomePage> {
  const { data, error } = await api.GET('/api/v1/incomes', {
    params: { query: { month, limit } },
  })
  if (error) throw new Error('Failed to load incomes')
  return data
}
