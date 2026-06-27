import useSWR from 'swr'

import { listExpenses } from '@/features/expenses/api/list-expenses'
import { expensesKey } from '@/shared/swr-keys'

export function useExpenses(month: string) {
  const { data, error, isLoading } = useSWR(expensesKey(month), () => listExpenses(month))
  return { expenses: data ?? [], error, isLoading }
}
