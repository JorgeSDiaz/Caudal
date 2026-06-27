import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'
import { formatMinorUnits } from '@/shared/money'

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
    <div className="flex flex-col items-center gap-6">
      <div className="relative aspect-square w-full max-w-[17rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="total_cents"
              nameKey="category_name"
              innerRadius="64%"
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
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
            Total
          </span>
          <span className="text-xl font-semibold tracking-tight tabular-nums">
            {formatMinorUnits(report.total_cents)}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
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
