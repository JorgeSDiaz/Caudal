import { useState } from 'react'
import { Pie, PieChart, ResponsiveContainer, Sector } from 'recharts'
import type { PieSectorShapeProps } from 'recharts/types/polar/Pie'

import { formatMinorUnits } from '@/shared/money'
import { cn } from '@/lib/utils'

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

type ColoredSlice = DonutSlice & { color: string; percent: number }

function ActiveSlice({
  hoveredId,
  ...props
}: PieSectorShapeProps & { payload?: ColoredSlice; hoveredId: number | null }) {
  const isActive = props.payload?.id === hoveredId
  const isDimmed = hoveredId !== null && !isActive

  return (
    <Sector
      {...props}
      outerRadius={isActive ? Number(props.outerRadius) + 6 : props.outerRadius}
      style={{ opacity: isDimmed ? 0.45 : 1, transition: 'opacity 150ms ease, filter 150ms ease' }}
    />
  )
}

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
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const colors = PALETTES[palette]
  const colored: ColoredSlice[] = slices.map((slice, index) => ({
    ...slice,
    color: colors[index % colors.length],
    percent: total > 0 ? (slice.value / total) * 100 : 0,
  }))
  const hovered = colored.find((slice) => slice.id === hoveredId) ?? null

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
              shape={(props: PieSectorShapeProps) => (
                <ActiveSlice
                  {...props}
                  fill={(props.payload as ColoredSlice).color}
                  hoveredId={hoveredId}
                />
              )}
              onMouseEnter={(_, index) => setHoveredId(colored[index].id)}
              onMouseLeave={() => setHoveredId(null)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4">
          {hovered ? (
            <>
              <span className="text-muted-foreground w-full truncate text-center text-[0.7rem] font-medium tracking-wide uppercase">
                {hovered.label}
              </span>
              <span className="text-xl font-semibold tracking-tight tabular-nums">
                {formatMinorUnits(hovered.value)}
              </span>
              <span className="text-muted-foreground text-xs font-medium tabular-nums">
                {hovered.percent.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="text-muted-foreground text-[0.7rem] font-medium tracking-wide uppercase">
                Total
              </span>
              <span className="text-xl font-semibold tracking-tight tabular-nums">
                {formatMinorUnits(total)}
              </span>
            </>
          )}
        </div>
      </div>

      <ul className="w-full space-y-1">
        {colored.map((slice) => {
          const isHovered = slice.id === hoveredId
          return (
            <li
              key={slice.id}
              className={cn(
                'grid cursor-default grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 rounded-md px-2 py-1.5 text-sm transition-colors',
                isHovered && 'bg-muted',
              )}
              onMouseEnter={() => setHoveredId(slice.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="truncate">{slice.label}</span>
              </span>
              <span className="flex flex-col items-end leading-tight">
                <span className="font-medium tabular-nums">{formatMinorUnits(slice.value)}</span>
                <span
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{ gridTemplateRows: isHovered ? '1fr' : '0fr' }}
                >
                  <span className="overflow-hidden">
                    <span
                      className={cn(
                        'text-muted-foreground block text-[0.7rem] tabular-nums transition-opacity duration-200',
                        isHovered ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {slice.percent.toFixed(1)}%
                    </span>
                  </span>
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
