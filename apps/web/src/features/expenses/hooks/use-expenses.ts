import { useState } from 'react'
import useSWR from 'swr'

import { listExpenses } from '@/features/expenses/api/list-expenses'
import { expensesKey } from '@/shared/swr-keys'

const PAGE_SIZE = 50

export function useExpenses(month: string) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const { data, error, isLoading } = useSWR(expensesKey(month, limit), () =>
    listExpenses(month, limit),
  )
  const expenses = data?.items ?? []
  const total = data?.total ?? 0
  return {
    expenses,
    total,
    hasMore: expenses.length < total,
    loadMore: () => setLimit((current) => current + PAGE_SIZE),
    error,
    isLoading,
  }
}
