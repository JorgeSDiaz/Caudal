import { Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { deleteExpense } from '@/features/expenses/api/delete-expense'
import { ExpenseForm } from '@/features/expenses/components/expense-form'
import type { Expense } from '@/features/expenses/expense'
import { useExpenses } from '@/features/expenses/hooks/use-expenses'
import { ListPagination } from '@/shared/components/list-pagination'
import { formatMinorUnits } from '@/shared/money'
import { monthListMatch, reportKey } from '@/shared/swr-keys'

const dayFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dayFormatter.format(new Date(year, month - 1, day))
}

export function ExpenseList({ month }: { month: string }) {
  const {
    expenses,
    total,
    page,
    pageCount,
    offset,
    canGoPrevious,
    canGoNext,
    goPrevious,
    goNext,
    isLoading,
  } = useExpenses(month)
  const { categories } = useCategories()

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (expenses.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay gastos este mes.</p>
  }

  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))

  return (
    <div className="space-y-3">
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
      <ListPagination
        offset={offset}
        visible={expenses.length}
        total={total}
        page={page}
        pageCount={pageCount}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPrevious={goPrevious}
        onNext={goNext}
      />
    </div>
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
  const [isEditing, setIsEditing] = useState(false)

  async function handleDelete() {
    try {
      await deleteExpense(expense.id)
      await Promise.all([mutate(monthListMatch('expenses', month)), mutate(reportKey(month))])
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
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Editar gasto de ${categoryName}`}>
              <Pencil className="text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar gasto</DialogTitle>
              <DialogDescription>Ajusta monto, categoría, fecha o nota.</DialogDescription>
            </DialogHeader>
            <ExpenseForm expense={expense} onSaved={() => setIsEditing(false)} />
          </DialogContent>
        </Dialog>
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
