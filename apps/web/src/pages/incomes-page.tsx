import { Suspense, lazy } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IncomeForm } from '@/features/incomes/components/income-form'
import { IncomeList } from '@/features/incomes/components/income-list'
import { RecurrenceList } from '@/features/recurrences/components/recurrence-list'
import { IncomeSummary } from '@/features/reports/components/income-summary'
import { currentMonth } from '@/shared/dates'

// Code-split the chart-heavy breakdown (Recharts) out of the initial bundle.
const SourceBreakdown = lazy(() =>
  import('@/features/reports/components/source-breakdown').then((module) => ({
    default: module.SourceBreakdown,
  })),
)

export function IncomesPage() {
  const month = currentMonth()

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Registrar ingreso</CardTitle>
          <CardDescription>Sueldo, freelance, cashback…</CardDescription>
        </CardHeader>
        <CardContent>
          <IncomeForm />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <IncomeSummary month={month} />

        <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Card>
            <CardHeader>
              <CardTitle>De dónde viene</CardTitle>
              <CardDescription>Desglose por fuente</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}>
                <SourceBreakdown month={month} />
              </Suspense>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Movimientos</CardTitle>
              <CardDescription>Tus ingresos del mes</CardDescription>
            </CardHeader>
            <CardContent>
              <IncomeList month={month} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recurrentes</CardTitle>
            <CardDescription>Ingresos fijos que se registran solos</CardDescription>
          </CardHeader>
          <CardContent>
            <RecurrenceList kind="income" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
