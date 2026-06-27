import { Suspense, lazy } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { ExpenseForm } from '@/features/expenses/expense-form'
import { ExpenseList } from '@/features/expenses/expense-list'
import { currentMonth } from '@/features/expenses/keys'
import { MonthTotal } from '@/features/reports/month-total'

// Code-split the chart-heavy breakdown (Recharts) out of the initial bundle.
const CategoryBreakdown = lazy(() =>
  import('@/features/reports/category-breakdown').then((module) => ({
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
    <div className="bg-muted/40 min-h-svh">
      <header className="bg-background sticky top-0 z-10 border-b">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-2.5">
            <span className="text-xl font-semibold tracking-tight">Caudal</span>
            <span className="text-muted-foreground hidden text-sm sm:inline">Control de gastos</span>
          </div>
          <span className="text-muted-foreground text-sm font-medium capitalize">
            {monthLabel(month)}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-8 px-6 py-8 lg:grid-cols-[22rem_1fr]">
        <aside className="lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle>Registrar gasto</CardTitle>
              <CardDescription>En segundos</CardDescription>
            </CardHeader>
            <CardContent>
              <ExpenseForm />
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-8">
          <MonthTotal month={month} />

          <div className="grid gap-6 xl:grid-cols-2">
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
        </div>
      </main>
      <Toaster />
    </div>
  )
}

export default App
