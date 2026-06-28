import useSWR from 'swr'

import { listIncomes } from '@/features/incomes/api/list-incomes'
import { incomesKey } from '@/shared/swr-keys'

export function useIncomes(month: string) {
  const { data, error, isLoading } = useSWR(incomesKey(month), () => listIncomes(month))
  return { incomes: data ?? [], error, isLoading }
}
