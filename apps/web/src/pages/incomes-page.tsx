import { Suspense, lazy } from 'react'

import { IncomeForm } from '@/features/incomes/components/income-form'
import { IncomeList } from '@/features/incomes/components/income-list'
import { RecurrenceList } from '@/features/recurrences/components/recurrence-list'
import { IncomeSummary } from '@/features/reports/components/income-summary'
import {
  BentoCard,
  BentoCardContent,
  BentoCardHeader,
  BentoCardTitle,
} from '@/shared/components/bento-card'
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
    <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <div className="space-y-5 xl:sticky xl:top-5">
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>Registrar ingreso</BentoCardTitle>
          </BentoCardHeader>
          <BentoCardContent>
            <IncomeForm />
          </BentoCardContent>
        </BentoCard>

        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>Recurrentes</BentoCardTitle>
          </BentoCardHeader>
          <BentoCardContent>
            <RecurrenceList kind="income" />
          </BentoCardContent>
        </BentoCard>
      </div>

      <div className="space-y-5">
        <IncomeSummary month={month} />

        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_390px]">
          <BentoCard className="2xl:col-start-2">
            <BentoCardHeader>
              <BentoCardTitle>De dónde viene</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <Suspense fallback={<p className="text-muted-foreground text-sm">Cargando…</p>}>
                <SourceBreakdown month={month} />
              </Suspense>
            </BentoCardContent>
          </BentoCard>

          <BentoCard className="2xl:col-start-1 2xl:row-start-1">
            <BentoCardHeader>
              <BentoCardTitle>Movimientos</BentoCardTitle>
            </BentoCardHeader>
            <BentoCardContent>
              <IncomeList month={month} />
            </BentoCardContent>
          </BentoCard>
        </div>
      </div>
    </div>
  )
}
