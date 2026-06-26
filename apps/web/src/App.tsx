import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Toaster } from '@/components/ui/sonner'
import { ExpenseForm } from '@/features/expenses/expense-form'
import { ExpenseList } from '@/features/expenses/expense-list'
import { currentMonth } from '@/features/expenses/keys'

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
            <CardTitle className="capitalize">{monthLabel(month)}</CardTitle>
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
