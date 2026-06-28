import { BreakdownDonut } from '@/features/reports/components/breakdown-donut'
import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'

export function SourceBreakdown({ month }: { month: string }) {
  const { report, isLoading } = useMonthlyReport(month)

  if (isLoading || !report) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (report.income_total_cents === 0) {
    return <p className="text-muted-foreground text-sm">Sin ingresos este mes.</p>
  }

  const slices = report.by_source.map((item) => ({
    id: item.source_id,
    label: item.source_name,
    value: item.total_cents,
  }))

  return <BreakdownDonut slices={slices} total={report.income_total_cents} />
}
