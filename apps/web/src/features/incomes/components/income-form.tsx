import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CategorySelect } from '@/features/categories/components/category-select'
import { createIncome } from '@/features/incomes/api/create-income'
import { updateIncome } from '@/features/incomes/api/update-income'
import type { Income } from '@/features/incomes/income'
import { monthOf, todayIso } from '@/shared/dates'
import { formatMinorUnits, parseAmountToMinorUnits } from '@/shared/money'
import { monthListMatch, reportKey } from '@/shared/swr-keys'

function revalidateMonth(month: string): Promise<unknown> {
  return Promise.all([mutate(monthListMatch('incomes', month)), mutate(reportKey(month))])
}

export function IncomeForm({ income, onSaved }: { income?: Income; onSaved?: () => void }) {
  const isEditing = income !== undefined
  const [amount, setAmount] = useState(() => (income ? String(income.amount_cents) : ''))
  const [sourceId, setSourceId] = useState(() => (income ? String(income.source_id) : ''))
  const [occurredOn, setOccurredOn] = useState(() => income?.occurred_on ?? todayIso())
  const [note, setNote] = useState(() => income?.note ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const amountMinor = parseAmountToMinorUnits(amount)
  const canSubmit = amountMinor !== null && sourceId !== '' && !isSubmitting
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
        await Promise.all([
          revalidateMonth(monthOf(income.occurred_on)),
          revalidateMonth(monthOf(occurredOn)),
        ])
        toast.success('Ingreso actualizado')
        onSaved?.()
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
        setAmount('')
        setNote('')
      }
    } catch {
      toast.error(isEditing ? 'No se pudo actualizar el ingreso' : 'No se pudo registrar el ingreso')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="income-amount">Monto</Label>
        <Input
          id="income-amount"
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
        <CategorySelect id="source" kind="income" value={sourceId} onChange={setSourceId} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="income-date">Fecha</Label>
        <Input
          id="income-date"
          type="date"
          value={occurredOn}
          onChange={(event) => setOccurredOn(event.target.value)}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="income-note">Nota (opcional)</Label>
        <Input
          id="income-note"
          placeholder="Pago de nómina"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="h-11"
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={!canSubmit}>
        {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Registrar ingreso'}
      </Button>
    </form>
  )
}
