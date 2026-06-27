import { useExpenses } from '@/features/expenses/hooks/use-expenses'
import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'
import { cn } from '@/lib/utils'
import { formatMinorUnits } from '@/shared/money'

function changePercent(total: number, previous: number): number | null {
  if (previous === 0) return null // no previous month to compare against
  return Math.round(((total - previous) / previous) * 100)
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  )
}

export function MonthSummary({ month }: { month: string }) {
  const { report } = useMonthlyReport(month)
  const { expenses } = useExpenses(month)

  if (!report) {
    return <div className="bg-card h-[104px] rounded-xl border shadow-sm" />
  }

  const count = expenses.length
  const average = count > 0 ? Math.round(report.total_cents / count) : 0
  const change = changePercent(report.total_cents, report.previous_month_total_cents)

  return (
    <div className="bg-card text-card-foreground flex flex-wrap items-end justify-between gap-x-10 gap-y-4 rounded-xl border p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Gastado este mes
        </p>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {formatMinorUnits(report.total_cents)}
          </p>
          {change !== null && (
            <p
              className={cn(
                'pb-1.5 text-sm font-medium',
                change > 0 ? 'text-amber-600' : 'text-emerald-600',
              )}
            >
              {change > 0 ? '▲' : '▼'} {Math.abs(change)}% vs. mes anterior
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-8 sm:gap-10">
        <Stat label="Movimientos" value={count} />
        <Stat label="Promedio" value={formatMinorUnits(average)} />
      </div>
    </div>
  )
}
