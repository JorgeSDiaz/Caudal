import { useState } from 'react'
import { ArrowRight, ReceiptText, TrendingDown, TrendingUp, WalletCards } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ExpenseForm } from '@/features/expenses/components/expense-form'
import { useExpenses } from '@/features/expenses/hooks/use-expenses'
import { IncomeForm } from '@/features/incomes/components/income-form'
import { useIncomes } from '@/features/incomes/hooks/use-incomes'
import { changePercent } from '@/features/reports/change-percent'
import { useMonthlyReport } from '@/features/reports/hooks/use-monthly-report'
import type { MonthlyReport } from '@/features/reports/report'
import { cn } from '@/lib/utils'
import {
  BentoCard,
  BentoCardContent,
  BentoCardHeader,
  BentoCardTitle,
} from '@/shared/components/bento-card'
import { currentMonth } from '@/shared/dates'
import { formatMinorUnits } from '@/shared/money'

type Mode = 'expense' | 'income'

const modes: { value: Mode; label: string }[] = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
]

export function HomePage() {
  const month = currentMonth()
  const [mode, setMode] = useState<Mode>('expense')
  const { report } = useMonthlyReport(month)
  const { total: expenseCount } = useExpenses(month)
  const { total: incomeCount } = useIncomes(month)

  const expenseTotal = report?.expense_total_cents ?? 0
  const incomeTotal = report?.income_total_cents ?? 0
  const expenseAverage = expenseCount > 0 ? Math.round(expenseTotal / expenseCount) : 0
  const incomeAverage = incomeCount > 0 ? Math.round(incomeTotal / incomeCount) : 0
  const expenseChange = report
    ? changePercent(expenseTotal, report.previous_month_expense_total_cents)
    : null
  const incomeChange = report
    ? changePercent(incomeTotal, report.previous_month_income_total_cents)
    : null

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-5 xl:sticky xl:top-5 xl:order-2">
        <BentoCard>
          <BentoCardHeader>
            <BentoCardTitle>Registro rápido</BentoCardTitle>
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
      </div>

      <div className="space-y-5 xl:order-1">
        <MonthPulse report={report} />

        <div className="grid gap-5 lg:grid-cols-2">
          <MovementMetricCard
            to="/gastos"
            icon={ReceiptText}
            title="Gastos"
            value={formatMinorUnits(expenseTotal)}
            count={expenseCount}
            average={formatMinorUnits(expenseAverage)}
            change={expenseChange}
            tone="expense"
          />
          <MovementMetricCard
            to="/ingresos"
            icon={WalletCards}
            title="Ingresos"
            value={formatMinorUnits(incomeTotal)}
            count={incomeCount}
            average={formatMinorUnits(incomeAverage)}
            change={incomeChange}
            tone="income"
          />
        </div>

        <QuickRead report={report} />
      </div>
    </div>
  )
}

function MonthPulse({ report }: { report?: MonthlyReport }) {
  if (!report) {
    return <div className="bg-card h-[280px] rounded-lg border shadow-sm" />
  }

  const net = report.net_cents
  const isPositive = net >= 0
  const savingsRate =
    report.income_total_cents > 0
      ? Math.round((report.net_cents / report.income_total_cents) * 100)
      : null
  const usedRate =
    report.income_total_cents > 0
      ? Math.min(100, Math.round((report.expense_total_cents / report.income_total_cents) * 100))
      : report.expense_total_cents > 0
        ? 100
        : 0

  return (
    <BentoCard className="overflow-hidden">
      <BentoCardHeader>
        <BentoCardTitle>Pulso del mes</BentoCardTitle>
      </BentoCardHeader>
      <BentoCardContent>
        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-4">
            <p
              className={cn(
                'text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl',
                isPositive ? 'text-emerald-600' : 'text-red-600',
              )}
            >
              {formatMinorUnits(net)}
            </p>
            <div className="border-border grid gap-3 border-t pt-4 sm:grid-cols-3">
              <PulseStat
                label="Ingresos"
                value={formatMinorUnits(report.income_total_cents)}
                tone="good"
              />
              <PulseStat label="Gastos" value={formatMinorUnits(report.expense_total_cents)} />
              <PulseStat
                label="Ahorro"
                value={savingsRate === null ? '—' : `${savingsRate}%`}
                tone="good"
              />
            </div>
          </div>

          <div className="bg-muted/35 flex flex-col justify-between rounded-lg p-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Consumido
              </p>
              <p className="text-2xl font-semibold tabular-nums">{usedRate}%</p>
            </div>
            <div className="space-y-2">
              <div className="bg-background h-2 overflow-hidden rounded-full border">
                <div className="bg-primary h-full rounded-full" style={{ width: `${usedRate}%` }} />
              </div>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>Gastos</span>
                <span>Ingresos</span>
              </div>
            </div>
          </div>
        </div>
      </BentoCardContent>
    </BentoCard>
  )
}

function PulseStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'good'
}) {
  return (
    <div className="min-w-0">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{label}</p>
      <p
        className={cn(
          'truncate font-semibold tabular-nums',
          tone === 'good' && 'text-emerald-600',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function MovementMetricCard({
  to,
  icon: Icon,
  title,
  value,
  count,
  average,
  change,
  tone,
}: {
  to: string
  icon: LucideIcon
  title: string
  value: string
  count: number
  average: string
  change: number | null
  tone: 'expense' | 'income'
}) {
  const changeIsPositive = change !== null && change >= 0
  const changeColor =
    change === null
      ? 'text-muted-foreground'
      : tone === 'income'
        ? changeIsPositive
          ? 'text-emerald-600'
          : 'text-amber-600'
        : changeIsPositive
          ? 'text-amber-600'
          : 'text-emerald-600'

  return (
    <Link
      to={to}
      className="bg-card text-card-foreground group rounded-lg border p-5 shadow-sm transition-colors hover:bg-accent/40"
    >
      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="bg-primary/10 text-primary grid size-9 shrink-0 place-items-center rounded-lg">
              <Icon className="size-4" />
            </div>
            <p className="truncate font-semibold">{title}</p>
          </div>
          <ArrowRight className="text-muted-foreground size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </div>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          {change !== null && (
            <p className={cn('flex items-center gap-1 pb-1 text-sm font-medium', changeColor)}>
              {changeIsPositive ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
              {Math.abs(change)}%
            </p>
          )}
        </div>

        <p className="text-muted-foreground text-sm">
          <span className="font-medium text-foreground">{count}</span> movimientos · prom.{' '}
          <span className="font-medium text-foreground tabular-nums">{average}</span>
        </p>
      </div>
    </Link>
  )
}

function QuickRead({ report }: { report?: MonthlyReport }) {
  const topExpense = report?.by_category.slice(0, 3).map((item) => ({
    id: item.category_id,
    label: item.category_name,
    value: item.total_cents,
  }))
  const topIncome = report?.by_source.slice(0, 3).map((item) => ({
    id: item.source_id,
    label: item.source_name,
    value: item.total_cents,
  }))

  return (
    <BentoCard>
      <BentoCardHeader>
        <BentoCardTitle>Top del mes</BentoCardTitle>
      </BentoCardHeader>
      <BentoCardContent>
        <div className="grid gap-5 lg:grid-cols-2">
          <CompactRanking
            title="Salidas"
            empty="Sin gastos todavía."
            items={topExpense ?? []}
            total={report?.expense_total_cents ?? 0}
          />
          <CompactRanking
            title="Entradas"
            empty="Sin ingresos todavía."
            items={topIncome ?? []}
            total={report?.income_total_cents ?? 0}
          />
        </div>
      </BentoCardContent>
    </BentoCard>
  )
}

function CompactRanking({
  title,
  empty,
  items,
  total,
}: {
  title: string
  empty: string
  items: { id: number; label: string; value: number }[]
  total: number
}) {
  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">{title}</p>
      {items.length === 0 ? (
        <div className="bg-muted/40 rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
          {empty}
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0
            return (
              <li key={item.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{item.label}</span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatMinorUnits(item.value)}
                  </span>
                </div>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
