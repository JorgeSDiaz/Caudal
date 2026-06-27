/** Date helpers shared across features. ISO strings keep them comparable and URL-safe. */

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7)
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}
