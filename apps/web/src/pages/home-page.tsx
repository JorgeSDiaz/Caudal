import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExpenseForm } from '@/features/expenses/components/expense-form'
import { IncomeForm } from '@/features/incomes/components/income-form'
import { MonthSummary } from '@/features/reports/components/month-summary'
import { cn } from '@/lib/utils'
import { currentMonth } from '@/shared/dates'

type Mode = 'expense' | 'income'

const modes: { value: Mode; label: string }[] = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
]

export function HomePage() {
  const month = currentMonth()
  const [mode, setMode] = useState<Mode>('expense')

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Registrar</CardTitle>
          <CardDescription>En segundos</CardDescription>
          <div className="bg-muted mt-3 grid grid-cols-2 gap-1 rounded-lg p-1">
            {modes.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={cn(
                  'rounded-md py-1.5 text-sm font-medium transition-colors',
                  mode === option.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {mode === 'expense' ? <ExpenseForm /> : <IncomeForm />}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <MonthSummary month={month} />
        <Card>
          <CardHeader>
            <CardTitle>Ver el detalle</CardTitle>
            <CardDescription>Tus movimientos del mes</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link
              to="/gastos"
              className="bg-muted hover:bg-muted/70 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              Gastos →
            </Link>
            <Link
              to="/ingresos"
              className="bg-muted hover:bg-muted/70 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
            >
              Ingresos →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
