import { Suspense, lazy } from 'react'

import { ExpenseForm } from '@/features/expenses/components/expense-form'
import { ExpenseList } from '@/features/expenses/components/expense-list'
import { RecurrenceList } from '@/features/recurrences/components/recurrence-list'
import { MonthSummary } from '@/features/reports/components/month-summary'
import {
  BentoCard,
  BentoCardContent,
  BentoCardDescription,
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
    <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(460px,1fr)_minmax(390px,0.9fr)]">
      <div className="space-y-5 xl:sticky xl:top-5">
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>Registrar gasto</BentoCardTitle>
            <BentoCardDescription>Captura rápida del periodo</BentoCardDescription>
          </BentoCardHeader>
          <BentoCardContent>
            <ExpenseForm />
          </BentoCardContent>
        </BentoCard>

        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>Recurrentes</BentoCardTitle>
            <BentoCardDescription>Gastos fijos activos</BentoCardDescription>
          </BentoCardHeader>
          <BentoCardContent>
            <RecurrenceList kind="expense" />
          </BentoCardContent>
        </BentoCard>
      </div>

      <div className="space-y-5">
        <MonthSummary month={month} />

        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>En qué se fue</BentoCardTitle>
            <BentoCardDescription>Desglose por categoría</BentoCardDescription>
          </BentoCardHeader>
          <BentoCardContent>
            <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}>
              <CategoryBreakdown month={month} />
            </Suspense>
          </BentoCardContent>
        </BentoCard>
      </div>

      <BentoCard className="xl:col-start-2 2xl:col-start-auto">
        <BentoCardHeader>
          <BentoCardTitle>Movimientos</BentoCardTitle>
          <BentoCardDescription>Tus gastos del periodo</BentoCardDescription>
        </BentoCardHeader>
        <BentoCardContent>
          <ExpenseList month={month} />
        </BentoCardContent>
      </BentoCard>
    </div>
  )
}
