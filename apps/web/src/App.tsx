import { Suspense, lazy } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { BackupControls } from '@/features/expenses/components/backup-controls'
import { ExpenseForm } from '@/features/expenses/components/expense-form'
import { ExpenseList } from '@/features/expenses/components/expense-list'
import { MonthSummary } from '@/features/reports/components/month-summary'
import { currentMonth } from '@/shared/dates'

// Code-split the chart-heavy breakdown (Recharts) out of the initial bundle.
const CategoryBreakdown = lazy(() =>
  import('@/features/reports/components/category-breakdown').then((module) => ({
    default: module.CategoryBreakdown,
  })),
)

const monthLabelFormatter = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' })

function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return monthLabelFormatter.format(new Date(year, monthNumber - 1, 1))
}

function App() {
  const month = currentMonth()

  return (
    <div className="bg-muted/40 flex min-h-svh flex-col">
      <header className="bg-background border-b">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2.5">
            <span className="text-primary text-xl font-semibold tracking-tight">Caudal</span>
            <span className="text-muted-foreground hidden text-sm sm:inline">Control de gastos</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground text-sm font-medium capitalize">
              {monthLabel(month)}
            </span>
            <BackupControls />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-6 py-6">
          {/* Capture (hero) on the left; the month's payoff + detail on the right.
              Cards size to their own content — no forced stretching. */}
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
                    <Suspense
                      fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}
                    >
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
            </div>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  )
}

export default App
