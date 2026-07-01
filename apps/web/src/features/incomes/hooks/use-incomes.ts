import { useState } from 'react'
import useSWR from 'swr'

import { listIncomes } from '@/features/incomes/api/list-incomes'
import { incomesKey } from '@/shared/swr-keys'

const PAGE_SIZE = 8

export function useIncomes(month: string) {
  const [pageState, setPageState] = useState({ month, page: 1 })
  const page = pageState.month === month ? pageState.page : 1
  const offset = (page - 1) * PAGE_SIZE
  const { data, error, isLoading } = useSWR(incomesKey(month, PAGE_SIZE, offset), () =>
    listIncomes(month, PAGE_SIZE, offset),
  )
  const incomes = data?.items ?? []
  const total = data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))
  return {
    incomes,
    total,
    page,
    pageCount,
    pageSize: PAGE_SIZE,
    offset,
    canGoPrevious: page > 1,
    canGoNext: page < pageCount,
    goPrevious: () =>
      setPageState((current) => ({
        month,
        page: Math.max(1, (current.month === month ? current.page : page) - 1),
      })),
    goNext: () =>
      setPageState((current) => ({
        month,
        page: Math.min(pageCount, (current.month === month ? current.page : page) + 1),
      })),
    error,
    isLoading,
  }
}
