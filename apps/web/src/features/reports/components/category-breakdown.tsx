import { BreakdownDonut } from '@/features/reports/components/breakdown-donut'
import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'

export function CategoryBreakdown({ month }: { month: string }) {
  const { report, isLoading } = useMonthlyReport(month)

  if (isLoading || !report) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (report.expense_total_cents === 0) {
    return <p className="text-muted-foreground text-sm">Sin gastos este mes.</p>
  }

  const slices = report.by_category.map((item) => ({
    id: item.category_id,
    label: item.category_name,
    value: item.total_cents,
  }))

  return <BreakdownDonut slices={slices} total={report.expense_total_cents} />
}
