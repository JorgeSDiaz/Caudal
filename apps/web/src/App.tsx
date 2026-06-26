import { Suspense, lazy } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { ExpenseForm } from '@/features/expenses/expense-form'
import { ExpenseList } from '@/features/expenses/expense-list'
import { currentMonth } from '@/features/expenses/keys'

// Code-split the chart-heavy report (Recharts) out of the initial bundle.
const ReportView = lazy(() =>
  import('@/features/reports/report-view').then((module) => ({ default: module.ReportView })),
)

const monthLabelFormatter = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return monthLabelFormatter.format(new Date(year, monthNumber - 1, 1))
}

function App() {
  const month = currentMonth()

  return (
    <div className="bg-muted/30 min-h-svh">
      <div className="mx-auto flex max-w-md flex-col gap-6 p-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl tracking-tight">Caudal</CardTitle>
            <CardDescription>Registra un gasto en segundos</CardDescription>
          </CardHeader>
          <CardContent>
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>En qué se fue el mes</CardTitle>
            <CardDescription className="capitalize">{monthLabel(month)}</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}>
              <ReportView month={month} />
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
      <Toaster />
    </div>
  )
}

export default App
