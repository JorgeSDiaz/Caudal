/**
 * Money helpers. The API stores amounts as integer minor units (`amount_cents`).
 * For V1 the only currency is COP, which is used without decimal places, so one
 * minor unit equals one peso. (Revisit per-currency decimals when adding others.)
 */

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** Parse free-form user input into positive integer minor units, or null if invalid. */
export function parseAmountToMinorUnits(input: string): number | null {
  const digits = input.replace(/\D/g, '')
  if (digits === '') return null
  const value = Number(digits)
  return Number.isSafeInteger(value) && value > 0 ? value : null
}

/** Format integer minor units for display, e.g. 4500 -> "$ 4.500". */
export function formatMinorUnits(amount: number): string {
  return COP_FORMATTER.format(amount)
}
