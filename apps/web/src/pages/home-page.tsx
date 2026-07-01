import { useState } from 'react'
import { ArrowRight, ReceiptText, WalletCards } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ExpenseForm } from '@/features/expenses/components/expense-form'
import { IncomeForm } from '@/features/incomes/components/income-form'
import { RecurrenceList } from '@/features/recurrences/components/recurrence-list'
import { BalanceSummary } from '@/features/reports/components/balance-summary'
import { cn } from '@/lib/utils'
import {
  BentoCard,
  BentoCardContent,
  BentoCardDescription,
  BentoCardHeader,
  BentoCardTitle,
} from '@/shared/components/bento-card'
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
    <div className="grid auto-rows-min items-start gap-5 xl:grid-cols-12">
      <BentoCard className="xl:sticky xl:top-5 xl:col-span-4 xl:row-span-2">
        <BentoCardHeader>
          <BentoCardTitle>Registrar</BentoCardTitle>
          <BentoCardDescription>Movimiento nuevo sin cambiar de pantalla</BentoCardDescription>
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
        </BentoCardHeader>
        <BentoCardContent>
          {mode === 'expense' ? <ExpenseForm /> : <IncomeForm />}
        </BentoCardContent>
      </BentoCard>

      <div className="xl:col-span-8">
        <BalanceSummary month={month} />
      </div>

      <DetailLinkCard
        to="/gastos"
        icon={ReceiptText}
        title="Gastos"
        description="Movimientos, categorías y pagos fijos"
      />
      <DetailLinkCard
        to="/ingresos"
        icon={WalletCards}
        title="Ingresos"
        description="Fuentes, entradas y recurrencias"
      />

      <BentoCard className="xl:col-span-4">
        <BentoCardHeader>
          <BentoCardTitle>Gastos recurrentes</BentoCardTitle>
          <BentoCardDescription>Próximos cargos fijos</BentoCardDescription>
        </BentoCardHeader>
        <BentoCardContent>
          <RecurrenceList kind="expense" />
        </BentoCardContent>
      </BentoCard>

      <BentoCard className="xl:col-span-4">
        <BentoCardHeader>
          <BentoCardTitle>Ingresos recurrentes</BentoCardTitle>
          <BentoCardDescription>Entradas programadas</BentoCardDescription>
        </BentoCardHeader>
        <BentoCardContent>
          <RecurrenceList kind="income" />
        </BentoCardContent>
      </BentoCard>
    </div>
  )
}

function DetailLinkCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string
  icon: typeof ReceiptText
  title: string
  description: string
}) {
  return (
    <Link
      to={to}
      className="bg-card text-card-foreground group flex min-h-32 flex-col justify-between rounded-lg border p-5 shadow-sm transition-colors hover:bg-accent/40 xl:col-span-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="bg-primary/10 text-primary grid size-10 place-items-center rounded-lg">
          <Icon className="size-5" />
        </div>
        <ArrowRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Link>
  )
}
