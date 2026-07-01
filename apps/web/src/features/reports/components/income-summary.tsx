import { useIncomes } from '@/features/incomes/hooks/use-incomes'
import { changePercent } from '@/features/reports/change-percent'
import { Stat } from '@/features/reports/components/summary-stat'
import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'
import { cn } from '@/lib/utils'
import { formatMinorUnits } from '@/shared/money'

export function IncomeSummary({ month }: { month: string }) {
  const { report } = useMonthlyReport(month)
  const { total: count } = useIncomes(month)

  if (!report) {
    return <div className="bg-card h-[104px] rounded-lg border shadow-sm" />
  }

  const total = report.income_total_cents
  const average = count > 0 ? Math.round(total / count) : 0
  // Earning more than last month is the welcome direction here (opposite of expenses).
  const change = changePercent(total, report.previous_month_income_total_cents)

  return (
    <div className="bg-card text-card-foreground flex flex-wrap items-end justify-between gap-x-10 gap-y-3 rounded-lg border px-5 py-4 shadow-sm">
      <div className="space-y-1">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Ingresado este mes
        </p>
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
            {formatMinorUnits(total)}
          </p>
          {change !== null && (
            <p
              className={cn(
                'pb-1.5 text-sm font-medium',
                change >= 0 ? 'text-emerald-600' : 'text-amber-600',
              )}
            >
              {change >= 0 ? '▲' : '▼'} {Math.abs(change)}% vs. mes anterior
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
