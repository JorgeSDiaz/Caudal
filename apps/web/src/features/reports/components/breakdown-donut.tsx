import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

import { formatMinorUnits } from '@/shared/money'

const PALETTES = {
  neutral: [
    'var(--color-chart-1)',
    'var(--color-chart-2)',
    'var(--color-chart-3)',
    'var(--color-chart-4)',
    'var(--color-chart-5)',
  ],
  warm: [
    'var(--color-chart-warm-1)',
    'var(--color-chart-warm-2)',
    'var(--color-chart-warm-3)',
    'var(--color-chart-warm-4)',
    'var(--color-chart-warm-5)',
  ],
  cool: [
    'var(--color-chart-cool-1)',
    'var(--color-chart-cool-2)',
    'var(--color-chart-cool-3)',
    'var(--color-chart-cool-4)',
    'var(--color-chart-cool-5)',
  ],
} as const

export type DonutSlice = { id: number; label: string; value: number }
export type DonutPalette = keyof typeof PALETTES

/** Presentational donut + legend. Callers map their breakdown into slices. */
export function BreakdownDonut({
  slices,
  total,
  palette = 'neutral',
}: {
  slices: DonutSlice[]
  total: number
  palette?: DonutPalette
}) {
  const colors = PALETTES[palette]
  const colored = slices.map((slice, index) => ({
    ...slice,
    color: colors[index % colors.length],
  }))

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative aspect-square w-full max-w-[17rem]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={colored}
              dataKey="value"
              nameKey="label"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {colored.map((slice) => (
                <Cell key={slice.id} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
            Total
          </span>
          <span className="text-xl font-semibold tracking-tight tabular-nums">
            {formatMinorUnits(total)}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {colored.map((slice) => (
          <li key={slice.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="truncate">{slice.label}</span>
            </span>
            <span className="font-medium tabular-nums">{formatMinorUnits(slice.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
