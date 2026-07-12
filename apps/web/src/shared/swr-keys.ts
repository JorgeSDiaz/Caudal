/** Stable SWR keys shared across features so mutations can revalidate them. */

export function expensesKey(month: string, limit: number, offset: number) {
  return ['expenses', month, limit, offset] as const
}

export function incomesKey(month: string, limit: number, offset: number) {
  return ['incomes', month, limit, offset] as const
}

export function reportKey(month: string) {
  return ['report', month] as const
}

export function recurrencesKey(kind: 'expense' | 'income') {
  return ['recurrences', kind] as const
}

export function categoriesKey(kind: 'expense' | 'income', includeInactive = false) {
  return ['categories', kind, includeInactive] as const
}

export function categoriesMatch(kind?: 'expense' | 'income') {
  return (key: unknown): boolean =>
    Array.isArray(key) && key[0] === 'categories' && (kind === undefined || key[1] === kind)
}

/** Matches every loaded page of a month's movement list, regardless of page size. */
export function monthListMatch(name: 'expenses' | 'incomes', month: string) {
  return (key: unknown): boolean => Array.isArray(key) && key[0] === name && key[1] === month
}
