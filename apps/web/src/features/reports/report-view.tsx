import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { formatMinorUnits } from '@/features/expenses/money'
import { useMonthlyReport } from '@/features/reports/use-monthly-report'

const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

function changeVsPreviousMonth(total: number, previous: number): string | null {
  if (previous === 0) return null
  const percent = Math.round(((total - previous) / previous) * 100)
  if (percent === 0) return 'Igual que el mes anterior'
  return percent > 0
    ? `▲ ${percent}% vs. mes anterior`
    : `▼ ${Math.abs(percent)}% vs. mes anterior`
}

export function ReportView({ month }: { month: string }) {
  const { report, isLoading } = useMonthlyReport(month)

  if (isLoading || !report) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (report.total_cents === 0) {
    return <p className="text-muted-foreground text-sm">Sin gastos este mes.</p>
  }

  const change = changeVsPreviousMonth(report.total_cents, report.previous_month_total_cents)
  const slices = report.by_category.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-3xl font-semibold tracking-tight">
          {formatMinorUnits(report.total_cents)}
        </p>
        {change && <p className="text-muted-foreground text-sm">{change}</p>}
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total_cents"
              nameKey="category_name"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
            >
              {slices.map((slice) => (
                <Cell key={slice.category_id} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-2">
        {slices.map((slice) => (
          <li key={slice.category_id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate">{slice.category_name}</span>
            </span>
            <span className="font-medium tabular-nums">{formatMinorUnits(slice.total_cents)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
