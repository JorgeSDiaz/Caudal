import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { createExpense } from '@/features/expenses/api/create-expense'
import { updateExpense } from '@/features/expenses/api/update-expense'
import type { Expense } from '@/features/expenses/expense'
import { monthOf, todayIso } from '@/shared/dates'
import { formatMinorUnits, parseAmountToMinorUnits } from '@/shared/money'
import { expensesKey, reportKey } from '@/shared/swr-keys'

/** Revalidate the month list and report so the change shows up immediately. */
function revalidateMonth(month: string): Promise<unknown> {
  return Promise.all([mutate(expensesKey(month)), mutate(reportKey(month))])
}

export function ExpenseForm({
  expense,
  onSaved,
}: {
  /** When provided the form edits this expense instead of creating a new one. */
  expense?: Expense
  /** Called after a successful save (e.g. to close the edit dialog). */
  onSaved?: () => void
}) {
  const isEditing = expense !== undefined
  const { categories, isLoading } = useCategories()
  const [amount, setAmount] = useState(() => (expense ? String(expense.amount_cents) : ''))
  const [categoryId, setCategoryId] = useState(() =>
    expense ? String(expense.category_id) : '',
  )
  const [occurredOn, setOccurredOn] = useState(() => expense?.occurred_on ?? todayIso())
  const [note, setNote] = useState(() => expense?.note ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Derived during render — no effects (rerender-derived-state-no-effect).
  const amountMinor = parseAmountToMinorUnits(amount)
  const canSubmit = amountMinor !== null && categoryId !== '' && !isSubmitting
  // Show the amount formatted ($ and thousands separators) inside the field itself.
  const amountDisplay = amount === '' ? '' : formatMinorUnits(Number(amount))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (amountMinor === null || categoryId === '') return

    setIsSubmitting(true)
    try {
      const trimmedNote = note.trim() === '' ? null : note.trim()
      if (isEditing) {
        await updateExpense(expense.id, {
          amount_cents: amountMinor,
          category_id: Number(categoryId),
          occurred_on: occurredOn,
          note: trimmedNote,
        })
        // The edit may move the expense to another month — refresh both.
        await Promise.all([
          revalidateMonth(monthOf(expense.occurred_on)),
          revalidateMonth(monthOf(occurredOn)),
        ])
        toast.success('Gasto actualizado')
        onSaved?.()
      } else {
        await createExpense({
          amount_cents: amountMinor,
          currency: 'COP',
          category_id: Number(categoryId),
          occurred_on: occurredOn,
          note: trimmedNote,
        })
        await revalidateMonth(monthOf(occurredOn))
        toast.success('Gasto registrado')
        // Keep category and date for fast repeated entry; clear amount and note.
        setAmount('')
        setNote('')
      }
    } catch {
      toast.error(isEditing ? 'No se pudo actualizar el gasto' : 'No se pudo registrar el gasto')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Monto</Label>
        <Input
          id="amount"
          inputMode="numeric"
          autoFocus
          placeholder="$ 0"
          value={amountDisplay}
          onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
          className="!h-11 !text-lg font-semibold tabular-nums"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
          <SelectTrigger id="category" className="!h-11 w-full">
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Fecha</Label>
        <Input
          id="date"
          type="date"
          value={occurredOn}
          onChange={(event) => setOccurredOn(event.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Nota (opcional)</Label>
        <Input
          id="note"
          placeholder="Café con amigos"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="h-11"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
        {isSubmitting
          ? 'Guardando…'
          : isEditing
            ? 'Guardar cambios'
            : 'Registrar gasto'}
      </Button>
    </form>
  )
}
