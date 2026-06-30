import { useState } from 'react'
import useSWR from 'swr'

import { listIncomes } from '@/features/incomes/api/list-incomes'
import { incomesKey } from '@/shared/swr-keys'

const PAGE_SIZE = 50

export function useIncomes(month: string) {
  const [limit, setLimit] = useState(PAGE_SIZE)
  const { data, error, isLoading } = useSWR(incomesKey(month, limit), () =>
    listIncomes(month, limit),
  )
  const incomes = data?.items ?? []
  const total = data?.total ?? 0
  return {
    incomes,
    total,
    hasMore: incomes.length < total,
    loadMore: () => setLimit((current) => current + PAGE_SIZE),
    error,
    isLoading,
  }
}
