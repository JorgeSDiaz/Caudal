import useSWR from 'swr'

import { getMonthlyReport } from '@/features/reports/api/get-monthly-report'
import { reportKey } from '@/shared/swr-keys'

export function useMonthlyReport(month: string) {
  const { data, error, isLoading } = useSWR(reportKey(month), () => getMonthlyReport(month))
  return { report: data, error, isLoading }
}
