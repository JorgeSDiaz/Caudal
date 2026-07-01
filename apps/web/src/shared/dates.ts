/** Date helpers shared across features. ISO strings keep them comparable and URL-safe. */

const PERIOD_BOUNDARY_DAY = 30

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

function localIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

function boundaryDay(year: number, month: number): number {
  return Math.min(PERIOD_BOUNDARY_DAY, daysInMonth(year, month))
}

function financialMonthKey(date: Date): string {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const nextMonth = month === 12 ? 1 : month + 1
  const nextMonthYear = month === 12 ? year + 1 : year

  if (date.getDate() >= boundaryDay(year, month)) {
    return `${nextMonthYear}-${pad2(nextMonth)}`
  }

  return `${year}-${pad2(month)}`
}

function localDateFromIso(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function currentMonth(): string {
  return financialMonthKey(new Date())
}

export function monthOf(isoDate: string): string {
  return financialMonthKey(localDateFromIso(isoDate))
}

export function todayIso(): string {
  return localIsoDate(new Date())
}
