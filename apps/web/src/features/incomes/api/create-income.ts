import { api } from '@/api/client'
import type { CreateIncomeInput, Income } from '@/features/incomes/income'

export async function createIncome(input: CreateIncomeInput): Promise<Income> {
  const { data, error } = await api.POST('/api/v1/incomes', { body: input })
  if (error) throw new Error('Failed to create income')
  return data
}
