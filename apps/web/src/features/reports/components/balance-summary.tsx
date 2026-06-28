import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'
import { cn } from '@/lib/utils'
import { formatMinorUnits } from '@/shared/money'

/** Share of income kept after expenses, or null when there's no income to divide by. */
function savingsRate(income: number, net: number): number | null {
  if (income === 0) return null
  return Math.round((net / income) * 100)
}

export function BalanceSummary({ month }: { month: string }) {
  const { report } = useMonthlyReport(month)

  if (!report) {
    return <div className="bg-card h-[148px] rounded-xl border shadow-sm" />
  }

  const net = report.net_cents
  const isPositive = net >= 0
  const rate = savingsRate(report.income_total_cents, net)

  return (
    <div className="bg-card text-card-foreground space-y-5 rounded-xl border p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Balance del mes
          </p>
          <p
            className={cn(
              'text-4xl font-semibold tracking-tight tabular-nums',
              isPositive ? 'text-emerald-600' : 'text-red-600',
            )}
          >
            {formatMinorUnits(net)}
          </p>
        </div>
        {rate !== null && (
          <div className="space-y-1 text-right">
            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
              Tasa de ahorro
            </p>
            <p
              className={cn(
                'text-2xl font-semibold tracking-tight tabular-nums',
                rate >= 0 ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {rate}%
            </p>
          </div>
        )}
      </div>

      <div className="border-border grid grid-cols-2 gap-4 border-t pt-4">
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Ingresos
          </p>
          <p className="text-xl font-semibold tracking-tight tabular-nums text-emerald-600">
            {formatMinorUnits(report.income_total_cents)}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Gastos
          </p>
          <p className="text-xl font-semibold tracking-tight tabular-nums">
            {formatMinorUnits(report.expense_total_cents)}
          </p>
        </div>
      </div>
    </div>
  )
}
