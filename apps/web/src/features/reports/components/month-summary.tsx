import { useExpenses } from '@/features/expenses/hooks/use-expenses'
import { changePercent } from '@/features/reports/change-percent'
import { Stat } from '@/features/reports/components/summary-stat'
import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'
import { cn } from '@/lib/utils'
import { formatMinorUnits } from '@/shared/money'

export function MonthSummary({ month }: { month: string }) {
  const { report } = useMonthlyReport(month)
  const { total: count } = useExpenses(month)

  if (!report) {
    return <div className="bg-card h-[104px] rounded-xl border shadow-sm" />
  }

  const total = report.expense_total_cents
  const average = count > 0 ? Math.round(total / count) : 0
  // Spending more than last month is the unwelcome direction here.
  const change = changePercent(total, report.previous_month_expense_total_cents)

  return (
    <div className="bg-card text-card-foreground flex flex-wrap items-end justify-between gap-x-10 gap-y-4 rounded-xl border p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Gastado este mes
        </p>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="text-4xl font-semibold tracking-tight tabular-nums">
            {formatMinorUnits(total)}
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
