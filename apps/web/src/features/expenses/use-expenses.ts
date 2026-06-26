import useSWR from 'swr'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { expensesKey } from '@/features/expenses/keys'

export type Expense = components['schemas']['ExpenseResponse']

async function fetchExpenses(month: string): Promise<Expense[]> {
  const { data, error } = await api.GET('/api/v1/expenses', {
    params: { query: { month } },
  })
  if (error) throw new Error('Failed to load expenses')
  return data
}

export function useExpenses(month: string) {
  const { data, error, isLoading } = useSWR(expensesKey(month), () => fetchExpenses(month))
  return { expenses: data ?? [], error, isLoading }
}
