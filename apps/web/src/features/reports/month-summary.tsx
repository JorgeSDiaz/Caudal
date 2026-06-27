import { formatMinorUnits } from '@/features/expenses/money'
import { useExpenses } from '@/features/expenses/use-expenses'
import { useMonthlyReport } from '@/features/reports/use-monthly-report'
import { cn } from '@/lib/utils'

function changePercent(total: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((total - previous) / previous) * 100)
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className={cn('text-2xl font-semibold tracking-tight tabular-nums', accent)}>{value}</p>
    </div>
  )
}

export function MonthSummary({ month }: { month: string }) {
  const { report } = useMonthlyReport(month)
  const { expenses } = useExpenses(month)

  if (!report) {
    return <div className="bg-card h-[104px] rounded-xl border shadow-sm" />
  }

  const change = changePercent(report.total_cents, report.previous_month_total_cents)
  const changeLabel = change === null ? '—' : `${change > 0 ? '▲' : '▼'} ${Math.abs(change)}%`
  const changeAccent =
    change === null ? undefined : change > 0 ? 'text-amber-600' : 'text-emerald-600'

  return (
    <div className="bg-card text-card-foreground grid gap-6 rounded-xl border p-6 shadow-sm sm:grid-cols-3">
      <Stat label="Gastado este mes" value={formatMinorUnits(report.total_cents)} />
      <Stat label="vs. mes anterior" value={changeLabel} accent={changeAccent} />
      <Stat label="Movimientos" value={expenses.length} />
    </div>
  )
}
