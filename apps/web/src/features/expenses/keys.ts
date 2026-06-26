/** Stable SWR keys and month helpers shared across the expenses feature. */

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function expensesKey(month: string) {
  return ['expenses', month] as const
}
