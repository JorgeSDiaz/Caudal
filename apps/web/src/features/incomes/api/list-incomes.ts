import { api } from '@/api/client'
import type { Income } from '@/features/incomes/income'

export async function listIncomes(month: string): Promise<Income[]> {
  const { data, error } = await api.GET('/api/v1/incomes', {
    params: { query: { month } },
  })
  if (error) throw new Error('Failed to load incomes')
  return data
}
