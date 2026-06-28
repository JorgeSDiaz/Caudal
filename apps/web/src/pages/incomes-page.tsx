import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { IncomeForm } from '@/features/incomes/components/income-form'
import { IncomeList } from '@/features/incomes/components/income-list'
import { currentMonth } from '@/shared/dates'

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
  )
}
