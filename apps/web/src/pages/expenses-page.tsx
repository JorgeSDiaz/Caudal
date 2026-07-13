import { Suspense, lazy } from 'react'

import { ExpenseForm } from '@/features/expenses/components/expense-form'
import { ExpenseList } from '@/features/expenses/components/expense-list'
import { MonthSummary } from '@/features/reports/components/month-summary'
import {
  BentoCard,
  BentoCardContent,
  BentoCardHeader,
  BentoCardTitle,
} from '@/shared/components/bento-card'
import { currentMonth } from '@/shared/dates'

// Code-split the chart-heavy breakdown (Recharts) out of the initial bundle.
const CategoryBreakdown = lazy(() =>
  import('@/features/reports/components/category-breakdown').then((module) => ({
    default: module.CategoryBreakdown,
  })),
)

export function ExpensesPage() {
  const month = currentMonth()

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-5 xl:sticky xl:top-5">
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>Registrar gasto</BentoCardTitle>
          </BentoCardHeader>
          <BentoCardContent>
            <ExpenseForm />
          </BentoCardContent>
        </BentoCard>
      </div>

      <div className="space-y-5">
        <MonthSummary month={month} />

        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <BentoCard className="2xl:col-start-2">
            <BentoCardHeader>
              <BentoCardTitle>En qué se fue</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}>
                <CategoryBreakdown month={month} />
              </Suspense>
            </BentoCardContent>
          </BentoCard>

          <BentoCard className="2xl:col-start-1 2xl:row-start-1">
            <BentoCardHeader>
              <BentoCardTitle>Movimientos</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <ExpenseList month={month} />
            </BentoCardContent>
          </BentoCard>
        </div>
      </div>
    </div>
  )
}
