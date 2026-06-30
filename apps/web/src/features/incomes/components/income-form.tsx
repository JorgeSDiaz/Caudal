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
import { createIncome } from '@/features/incomes/api/create-income'
import { updateIncome } from '@/features/incomes/api/update-income'
import type { Income } from '@/features/incomes/income'
import { createRecurrence } from '@/features/recurrences/api/create-recurrence'
import { RecurrenceConfig } from '@/features/recurrences/components/recurrence-config'
import { defaultRecurrenceConfig } from '@/features/recurrences/recurrence-config'
import { monthOf, todayIso } from '@/shared/dates'
import { formatMinorUnits, parseAmountToMinorUnits } from '@/shared/money'
import { monthListMatch, recurrencesKey, reportKey } from '@/shared/swr-keys'

/** Revalidate the month list (every loaded page) and report so the change shows up immediately. */
function revalidateMonth(month: string): Promise<unknown> {
  return Promise.all([mutate(monthListMatch('incomes', month)), mutate(reportKey(month))])
}

export function IncomeForm({
  income,
  onSaved,
}: {
  /** When provided the form edits this income instead of creating a new one. */
  income?: Income
  /** Called after a successful save (e.g. to close the edit dialog). */
  onSaved?: () => void
}) {
  const isEditing = income !== undefined
  const { categories, isLoading } = useCategories('income')
  const [amount, setAmount] = useState(() => (income ? String(income.amount_cents) : ''))
  const [sourceId, setSourceId] = useState(() => (income ? String(income.source_id) : ''))
  const [occurredOn, setOccurredOn] = useState(() => income?.occurred_on ?? todayIso())
  const [note, setNote] = useState(() => income?.note ?? '')
  const [recurrence, setRecurrence] = useState(defaultRecurrenceConfig)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Derived during render — no effects (rerender-derived-state-no-effect).
  const amountMinor = parseAmountToMinorUnits(amount)
  const canSubmit = amountMinor !== null && sourceId !== '' && !isSubmitting
  // Show the amount formatted ($ and thousands separators) inside the field itself.
  const amountDisplay = amount === '' ? '' : formatMinorUnits(Number(amount))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (amountMinor === null || sourceId === '') return

    setIsSubmitting(true)
    try {
      const trimmedNote = note.trim() === '' ? null : note.trim()
      if (isEditing) {
        await updateIncome(income.id, {
          amount_cents: amountMinor,
          source_id: Number(sourceId),
          occurred_on: occurredOn,
          note: trimmedNote,
        })
        // The edit may move the income to another month — refresh both.
        await Promise.all([
          revalidateMonth(monthOf(income.occurred_on)),
          revalidateMonth(monthOf(occurredOn)),
        ])
        toast.success('Ingreso actualizado')
        onSaved?.()
      } else if (recurrence.recurring) {
        await createRecurrence({
          kind: 'income',
          amount_cents: amountMinor,
          currency: 'COP',
          category_id: Number(sourceId),
          frequency: recurrence.frequency,
          day_of_month: recurrence.dayOfMonth,
          second_day_of_month:
            recurrence.frequency === 'biweekly' ? recurrence.secondDayOfMonth : null,
          start_date: occurredOn,
          end_date: recurrence.endDate === '' ? null : recurrence.endDate,
          note: trimmedNote,
        })
        await mutate(recurrencesKey('income'))
        toast.success('Recurrencia creada')
        setAmount('')
        setNote('')
        setRecurrence(defaultRecurrenceConfig)
      } else {
        await createIncome({
          amount_cents: amountMinor,
          currency: 'COP',
          source_id: Number(sourceId),
          occurred_on: occurredOn,
          note: trimmedNote,
        })
        await revalidateMonth(monthOf(occurredOn))
        toast.success('Ingreso registrado')
        // Keep source and date for fast repeated entry; clear amount and note.
        setAmount('')
        setNote('')
      }
    } catch {
      const action = isEditing
        ? 'actualizar el ingreso'
        : recurrence.recurring
          ? 'crear la recurrencia'
          : 'registrar el ingreso'
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
        <Label htmlFor="source">Fuente</Label>
        <Select value={sourceId} onValueChange={setSourceId} disabled={isLoading}>
          <SelectTrigger id="source" className="!h-11 w-full">
            <SelectValue placeholder="Elige una fuente" />
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
          placeholder="Quincena de junio"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="h-11"
        />
      </div>

      {!isEditing && <RecurrenceConfig value={recurrence} onChange={setRecurrence} />}

      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
        {isSubmitting
          ? 'Guardando…'
          : isEditing
            ? 'Guardar cambios'
            : recurrence.recurring
              ? 'Crear recurrencia'
              : 'Registrar ingreso'}
      </Button>
    </form>
  )
}
