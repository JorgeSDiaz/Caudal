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
import { createExpense } from '@/features/expenses/create-expense'
import { expensesKey, monthOf, reportKey } from '@/features/expenses/keys'
import { formatMinorUnits, parseAmountToMinorUnits } from '@/features/expenses/money'
import { useCategories } from '@/features/expenses/use-categories'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ExpenseForm() {
  const { categories, isLoading } = useCategories()
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [occurredOn, setOccurredOn] = useState(todayIso)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Derived during render — no effects (rerender-derived-state-no-effect).
  const amountMinor = parseAmountToMinorUnits(amount)
  const canSubmit = amountMinor !== null && categoryId !== '' && !isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (amountMinor === null || categoryId === '') return

    setIsSubmitting(true)
    try {
      await createExpense({
        amount_cents: amountMinor,
        currency: 'COP',
        category_id: Number(categoryId),
        occurred_on: occurredOn,
        note: note.trim() === '' ? null : note.trim(),
      })
      const changedMonth = monthOf(occurredOn)
      await Promise.all([mutate(expensesKey(changedMonth)), mutate(reportKey(changedMonth))])
      toast.success('Gasto registrado')
      // Keep category and date for fast repeated entry; clear amount and note.
      setAmount('')
      setNote('')
    } catch {
      toast.error('No se pudo registrar el gasto')
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
          placeholder="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="text-lg"
        />
        {amountMinor !== null && (
          <p className="text-muted-foreground text-sm">{formatMinorUnits(amountMinor)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoría</Label>
        <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
          <SelectTrigger id="category" className="w-full">
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
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="note">Nota (opcional)</Label>
        <Input
          id="note"
          placeholder="Café con amigos"
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {isSubmitting ? 'Guardando…' : 'Registrar gasto'}
      </Button>
    </form>
  )
}
