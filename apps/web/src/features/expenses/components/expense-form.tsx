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
import { createRecurrence } from '@/features/recurrences/api/create-recurrence'
import { updateRecurrence } from '@/features/recurrences/api/update-recurrence'
import { RecurrenceConfig } from '@/features/recurrences/components/recurrence-config'
import { useRecurrences } from '@/features/recurrences/hooks/use-recurrences'
import { defaultRecurrenceConfig } from '@/features/recurrences/recurrence-config'
import { monthOf, todayIso } from '@/shared/dates'
import { formatMinorUnits, parseAmountToMinorUnits } from '@/shared/money'
import { monthListMatch, recurrencesKey, reportKey } from '@/shared/swr-keys'

/** Revalidate the month list (every loaded page) and report so the change shows up immediately. */
function revalidateMonth(month: string): Promise<unknown> {
  return Promise.all([mutate(monthListMatch('expenses', month)), mutate(reportKey(month))])
}

function dayOfMonth(isoDate: string): number {
  return Number(isoDate.split('-')[2])
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
  const { recurrences } = useRecurrences('expense')
  const linkedRecurrence = recurrences.find((item) => item.id === expense?.recurrence_id)
  const [amount, setAmount] = useState(() => (expense ? String(expense.amount_cents) : ''))
  const [categoryId, setCategoryId] = useState(() =>
    expense ? String(expense.category_id) : '',
  )
  const [occurredOn, setOccurredOn] = useState(() => expense?.occurred_on ?? todayIso())
  const [note, setNote] = useState(() => expense?.note ?? '')
  const [recurrenceDraft, setRecurrenceDraft] = useState<typeof defaultRecurrenceConfig | null>(null)
  const recurrence = recurrenceDraft ?? {
    ...defaultRecurrenceConfig,
    recurring: linkedRecurrence !== undefined,
    frequency: linkedRecurrence?.frequency ?? defaultRecurrenceConfig.frequency,
    endDate: linkedRecurrence?.end_date ?? defaultRecurrenceConfig.endDate,
  }
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Derived during render — no effects (rerender-derived-state-no-effect).
  const amountMinor = parseAmountToMinorUnits(amount)
  const canSubmit = amountMinor !== null && categoryId !== '' && !isSubmitting
  // expense.recurrence_id may point at a deleted recurrence — only an active one counts as linked.
  const isLinkedToRecurrence = linkedRecurrence !== undefined
  const willCreateRecurrence = isEditing && recurrence.recurring && !isLinkedToRecurrence
  // Show the amount formatted ($ and thousands separators) inside the field itself.
  const amountDisplay = amount === '' ? '' : formatMinorUnits(Number(amount))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (amountMinor === null || categoryId === '') return

    setIsSubmitting(true)
    try {
      const trimmedNote = note.trim() === '' ? null : note.trim()
      if (isEditing) {
        let recurrenceId = linkedRecurrence?.id ?? null
        if (recurrence.recurring && recurrenceId === null) {
          const created = await createRecurrence({
            kind: 'expense',
            amount_cents: amountMinor,
            currency: 'COP',
            category_id: Number(categoryId),
            frequency: recurrence.frequency,
            day_of_month: dayOfMonth(occurredOn),
            second_day_of_month: null,
            start_date: occurredOn,
            end_date: recurrence.endDate === '' ? null : recurrence.endDate,
            note: trimmedNote,
          })
          recurrenceId = created.id
          await mutate(recurrencesKey('expense'))
        } else if (recurrence.recurring && recurrenceId !== null) {
          await updateRecurrence(recurrenceId, {
            amount_cents: amountMinor,
            currency: 'COP',
            category_id: Number(categoryId),
            frequency: recurrence.frequency,
            day_of_month: dayOfMonth(occurredOn),
            second_day_of_month: null,
            start_date: occurredOn,
            end_date: recurrence.endDate === '' ? null : recurrence.endDate,
            note: trimmedNote,
            is_active: true,
          })
          await mutate(recurrencesKey('expense'))
        }
        await updateExpense(expense.id, {
          amount_cents: amountMinor,
          category_id: Number(categoryId),
          occurred_on: occurredOn,
          note: trimmedNote,
          recurrence_id: recurrence.recurring ? recurrenceId : null,
        })
        // The edit may move the expense to another month — refresh both.
        await Promise.all([
          revalidateMonth(monthOf(expense.occurred_on)),
          revalidateMonth(monthOf(occurredOn)),
        ])
        toast.success(
          willCreateRecurrence ? 'Gasto actualizado y recurrencia creada' : 'Gasto actualizado',
        )
        onSaved?.()
      } else if (recurrence.recurring) {
        await createRecurrence({
          kind: 'expense',
          amount_cents: amountMinor,
          currency: 'COP',
          category_id: Number(categoryId),
          frequency: recurrence.frequency,
          day_of_month: dayOfMonth(occurredOn),
          second_day_of_month: null,
          start_date: occurredOn,
          end_date: recurrence.endDate === '' ? null : recurrence.endDate,
          note: trimmedNote,
        })
        await mutate(recurrencesKey('expense'))
        toast.success('Recurrencia creada')
        setAmount('')
        setNote('')
        setRecurrenceDraft(defaultRecurrenceConfig)
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
      const action = isEditing
        ? willCreateRecurrence
          ? 'actualizar el gasto y crear la recurrencia'
          : 'actualizar el gasto'
        : recurrence.recurring
          ? 'crear la recurrencia'
          : 'registrar el gasto'
      toast.error(`No se pudo ${action}`)
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
        <Label htmlFor="date">{recurrence.recurring ? 'Desde' : 'Fecha'}</Label>
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

      <RecurrenceConfig value={recurrence} onChange={setRecurrenceDraft} />

      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
        {isSubmitting
          ? 'Guardando…'
          : willCreateRecurrence
            ? 'Guardar y crear recurrencia'
            : recurrence.recurring && !isEditing
              ? 'Crear recurrencia'
            : isEditing
              ? 'Guardar cambios'
              : 'Registrar gasto'}
      </Button>
    </form>
  )
}
