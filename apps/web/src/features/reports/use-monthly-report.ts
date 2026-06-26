import useSWR from 'swr'

import { api } from '@/api/client'
import type { components } from '@/api/schema'
import { reportKey } from '@/features/expenses/keys'

export type MonthlyReport = components['schemas']['MonthlyReportResponse']

async function fetchReport(month: string): Promise<MonthlyReport> {
  const { data, error } = await api.GET('/api/v1/reports/monthly', {
    params: { query: { month } },
  })
  if (error) throw new Error('Failed to load report')
  return data
}

export function useMonthlyReport(month: string) {
  const { data, error, isLoading } = useSWR(reportKey(month), () => fetchReport(month))
  return { report: data, error, isLoading }
}
