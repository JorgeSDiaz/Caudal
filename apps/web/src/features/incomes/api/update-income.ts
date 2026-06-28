import { api } from '@/api/client'
import type { Income, UpdateIncomeInput } from '@/features/incomes/income'

export async function updateIncome(id: number, input: UpdateIncomeInput): Promise<Income> {
  const { data, error } = await api.PATCH('/api/v1/incomes/{income_id}', {
    params: { path: { income_id: id } },
    body: input,
  })
  if (error) throw new Error('Failed to update income')
  return data
}
