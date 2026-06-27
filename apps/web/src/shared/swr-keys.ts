/** Stable SWR keys shared across features so mutations can revalidate them. */

export function expensesKey(month: string) {
  return ['expenses', month] as const
}

export function reportKey(month: string) {
  return ['report', month] as const
}
