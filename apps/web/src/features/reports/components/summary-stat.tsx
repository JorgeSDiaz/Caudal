/** A small labelled figure used in the monthly summary cards. */
export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="space-y-1">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  )
}
