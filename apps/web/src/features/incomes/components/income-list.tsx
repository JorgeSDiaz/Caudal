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
import { deleteIncome } from '@/features/incomes/api/delete-income'
import { IncomeForm } from '@/features/incomes/components/income-form'
import type { Income } from '@/features/incomes/income'
import { useIncomes } from '@/features/incomes/hooks/use-incomes'
import { ListPagination } from '@/shared/components/list-pagination'
import { formatMinorUnits } from '@/shared/money'
import { monthListMatch, reportKey } from '@/shared/swr-keys'

const dayFormatter = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' })

function formatDay(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  return dayFormatter.format(new Date(year, month - 1, day))
}

export function IncomeList({ month }: { month: string }) {
  const {
    incomes,
    total,
    page,
    pageCount,
    offset,
    canGoPrevious,
    canGoNext,
    goPrevious,
    goNext,
    isLoading,
  } = useIncomes(month)
  const { categories } = useCategories('income')

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (incomes.length === 0) {
    return <p className="text-muted-foreground text-sm">Aún no hay ingresos este mes.</p>
  }

  const sourceNames = new Map(categories.map((category) => [category.id, category.name]))

  return (
    <div className="space-y-3">
      <ul className="divide-border divide-y">
        {incomes.map((income) => (
          <IncomeRow
            key={income.id}
            income={income}
            sourceName={sourceNames.get(income.source_id) ?? '—'}
            month={month}
          />
        ))}
      </ul>
      <ListPagination
        offset={offset}
        visible={incomes.length}
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

function IncomeRow({
  income,
  sourceName,
  month,
}: {
  income: Income
  sourceName: string
  month: string
}) {
  const [isEditing, setIsEditing] = useState(false)

  async function handleDelete() {
    try {
      await deleteIncome(income.id)
      await Promise.all([mutate(monthListMatch('incomes', month)), mutate(reportKey(month))])
      toast.success('Ingreso eliminado')
    } catch {
      toast.error('No se pudo eliminar el ingreso')
    }
  }

  return (
    <li className="grid gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium">{sourceName}</p>
        <p className="text-muted-foreground truncate text-sm">
          {formatDay(income.occurred_on)}
          {income.note ? ` · ${income.note}` : ''}
        </p>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatMinorUnits(income.amount_cents)}
        </span>
        <div className="flex items-center gap-1">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={`Editar ingreso de ${sourceName}`}>
                <Pencil className="text-muted-foreground" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar ingreso</DialogTitle>
                <DialogDescription>Ajusta monto, fuente, fecha o nota.</DialogDescription>
              </DialogHeader>
              <IncomeForm income={income} onSaved={() => setIsEditing(false)} />
            </DialogContent>
          </Dialog>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Eliminar ingreso de ${sourceName}`}
            onClick={handleDelete}
          >
            <Trash2 className="text-muted-foreground" />
          </Button>
        </div>
      </div>
    </li>
  )
}
