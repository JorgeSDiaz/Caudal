import { Suspense, lazy } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseForm } from '@/features/expenses/components/expense-form'
import { ExpenseList } from '@/features/expenses/components/expense-list'
import { RecurrenceList } from '@/features/recurrences/components/recurrence-list'
import { MonthSummary } from '@/features/reports/components/month-summary'
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
    <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Registrar gasto</CardTitle>
          <CardDescription>En segundos</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <MonthSummary month={month} />

        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>En qué se fue</CardTitle>
              <CardDescription>Desglose por categoría</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}>
                <CategoryBreakdown month={month} />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movimientos</CardTitle>
              <CardDescription>Tus gastos del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseList month={month} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recurrentes</CardTitle>
            <CardDescription>Gastos fijos que se registran solos</CardDescription>
          </CardHeader>
          <CardContent>
            <RecurrenceList kind="expense" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
