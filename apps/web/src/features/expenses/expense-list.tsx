import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import { deleteExpense } from '@/features/expenses/delete-expense'
import { expensesKey, reportKey } from '@/features/expenses/keys'
import { formatMinorUnits } from '@/features/expenses/money'
import { useCategories } from '@/features/expenses/use-categories'
import { type Expense, useExpenses } from '@/features/expenses/use-expenses'

const dayFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dayFormatter.format(new Date(year, month - 1, day))
}

export function ExpenseList({ month }: { month: string }) {
  const { expenses, isLoading } = useExpenses(month)
  const { categories } = useCategories()

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (expenses.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay gastos este mes.</p>
  }

  // Derived during render: id -> category name lookup.
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))

  return (
    <ul className="divide-border divide-y">
      {expenses.map((expense) => (
        <ExpenseRow
          key={expense.id}
          expense={expense}
          categoryName={categoryNames.get(expense.category_id) ?? '—'}
          month={month}
        />
      ))}
    </ul>
  )
}

function ExpenseRow({
  expense,
  categoryName,
  month,
}: {
  expense: Expense
  categoryName: string
  month: string
}) {
  async function handleDelete() {
    try {
      await deleteExpense(expense.id)
      await Promise.all([mutate(expensesKey(month)), mutate(reportKey(month))])
      toast.success('Gasto eliminado')
    } catch {
      toast.error('No se pudo eliminar el gasto')
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{categoryName}</p>
        <p className="text-muted-foreground truncate text-sm">
          {formatDay(expense.occurred_on)}
          {expense.note ? ` · ${expense.note}` : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-semibold tabular-nums">{formatMinorUnits(expense.amount_cents)}</span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Eliminar gasto de ${categoryName}`}
          onClick={handleDelete}
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      </div>
    </li>
  )
}
