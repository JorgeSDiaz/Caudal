import { cn } from '@/lib/utils'
import { formatMinorUnits } from '@/features/expenses/money'
import { useMonthlyReport } from '@/features/reports/use-monthly-report'

function changePercent(total: number, previous: number): number | null {
  if (previous === 0) return null
  return Math.round(((total - previous) / previous) * 100)
}

export function MonthTotal({ month }: { month: string }) {
  const { report, isLoading } = useMonthlyReport(month)

  if (isLoading || !report) {
    return <div className="bg-muted h-14 w-56 animate-pulse rounded-lg" />
  }

  const change = changePercent(report.total_cents, report.previous_month_total_cents)

  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-sm font-medium">Gastado este mes</p>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-4xl font-semibold tracking-tight tabular-nums">
          {formatMinorUnits(report.total_cents)}
        </span>
        {change !== null && change !== 0 && (
          <span
            className={cn(
              'text-sm font-medium',
              change > 0 ? 'text-amber-600' : 'text-emerald-600',
            )}
          >
            {change > 0 ? '▲' : '▼'} {Math.abs(change)}% vs. mes anterior
          </span>
        )}
      </div>
    </div>
  )
}
