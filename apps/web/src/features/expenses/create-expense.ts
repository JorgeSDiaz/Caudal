import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type CreateExpenseInput = components['schemas']['CreateExpenseRequest']
export type Expense = components['schemas']['ExpenseResponse']

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const { data, error } = await api.POST('/api/v1/expenses', { body: input })
  if (error) throw new Error('Failed to create expense')
  return data
}
