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

export function CategoryBreakdown({ month }: { month: string }) {
  const { report, isLoading } = useMonthlyReport(month)

  if (isLoading || !report) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (report.total_cents === 0) {
    return <p className="text-muted-foreground text-sm">Sin gastos este mes.</p>
  }

  const slices = report.by_category.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }))

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="h-44 w-44 shrink-0">
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
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.category_id} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full flex-1 space-y-2.5">
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
