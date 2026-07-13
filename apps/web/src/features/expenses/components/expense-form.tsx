import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategorySelect } from '@/features/categories/components/category-select'
import { createExpense } from '@/features/expenses/api/create-expense'
import { updateExpense } from '@/features/expenses/api/update-expense'
import type { Expense } from '@/features/expenses/expense'
import { monthOf, todayIso } from '@/shared/dates'
import { formatMinorUnits, parseAmountToMinorUnits } from '@/shared/money'
import { monthListMatch, reportKey } from '@/shared/swr-keys'

function revalidateMonth(month: string): Promise<unknown> {
  return Promise.all([mutate(monthListMatch('expenses', month)), mutate(reportKey(month))])
}

export function ExpenseForm({
  expense,
  onSaved,
}: {
  expense?: Expense
  onSaved?: () => void
}) {
  const isEditing = expense !== undefined
  const [amount, setAmount] = useState(() => (expense ? String(expense.amount_cents) : ''))
  const [categoryId, setCategoryId] = useState(() =>
    expense ? String(expense.category_id) : '',
  )
  const [occurredOn, setOccurredOn] = useState(() => expense?.occurred_on ?? todayIso())
  const [note, setNote] = useState(() => expense?.note ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const amountMinor = parseAmountToMinorUnits(amount)
  const canSubmit = amountMinor !== null && categoryId !== '' && !isSubmitting
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
        <CategorySelect id="category" kind="expense" value={categoryId} onChange={setCategoryId} />
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
        {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar gasto'}
      </Button>
    </form>
  )
}
