/** Month-over-month change as a rounded percentage, or null when there's no base. */
export function changePercent(total: number, previous: number): number | null {
  if (previous === 0) return null // no previous month to compare against
  return Math.round(((total - previous) / previous) * 100)
}
