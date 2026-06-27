import { api } from '@/api/client'
import type { MonthlyReport } from '@/features/reports/report'

export async function getMonthlyReport(month: string): Promise<MonthlyReport> {
  const { data, error } = await api.GET('/api/v1/reports/monthly', {
    params: { query: { month } },
  })
  if (error) throw new Error('Failed to load report')
  return data
}
