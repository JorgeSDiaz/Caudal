import { useMemo, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { DayButton, type DayButtonProps } from 'react-day-picker'
import { es } from 'react-day-picker/locale'

import { Calendar } from '@/components/ui/calendar'
import type { Category } from '@/features/categories/category'
import { CategoryIcon } from '@/features/categories/category-icons'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { describeSchedule } from '@/features/recurrences/describe'
import { useRecurrences } from '@/features/recurrences/hooks/use-recurrences'
import type { Recurrence, RecurrenceKind } from '@/features/recurrences/recurrence'
import { cn } from '@/lib/utils'
import { formatMinorUnits } from '@/shared/money'

type CalendarOccurrence = {
  date: Date
  recurrence: Recurrence
  kind: RecurrenceKind
  name: string
  icon: string | null
}

const kindLabels: Record<RecurrenceKind, string> = {
  expense: 'Egreso',
  income: 'Ingreso',
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function dateFromIso(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function dateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function isBeforeDay(left: Date, right: Date): boolean {
  return dateKey(left) < dateKey(right)
}

function isAfterDay(left: Date, right: Date): boolean {
  return dateKey(left) > dateKey(right)
}

function projectRecurrence(
  recurrence: Recurrence,
  kind: RecurrenceKind,
  category: Category | undefined,
  month: Date,
): CalendarOccurrence[] {
  if (!recurrence.is_active) return []

  const year = month.getFullYear()
  const monthIndex = month.getMonth()
  const monthStart = new Date(year, monthIndex, 1)
  const monthEnd = new Date(year, monthIndex, daysInMonth(year, monthIndex))
  const startDate = dateFromIso(recurrence.start_date)
  const endDate = recurrence.end_date ? dateFromIso(recurrence.end_date) : null

  if (recurrence.frequency === 'biweekly') {
    const occurrences: CalendarOccurrence[] = []
    for (
      let occurrence = startDate;
      !isAfterDay(occurrence, monthEnd);
      occurrence = addDays(occurrence, 15)
    ) {
      if (isBeforeDay(occurrence, monthStart)) continue
      if (endDate && isAfterDay(occurrence, endDate)) break
      occurrences.push({
        date: occurrence,
        recurrence,
        kind,
        name: category?.name ?? (kind === 'income' ? 'Sin fuente' : 'Sin categoría'),
        icon: category?.icon ?? null,
      })
    }
    return occurrences
  }

  const occurrence = new Date(year, monthIndex, Math.min(recurrence.day_of_month, monthEnd.getDate()))
  if (isBeforeDay(occurrence, startDate)) return []
  if (endDate && isAfterDay(occurrence, endDate)) return []
  return [{
    date: occurrence,
    recurrence,
    kind,
    name: category?.name ?? (kind === 'income' ? 'Sin fuente' : 'Sin categoría'),
    icon: category?.icon ?? null,
  }]
}

function occurrenceSummary(occurrences: CalendarOccurrence[]) {
  return {
    expense: occurrences.filter((occurrence) => occurrence.kind === 'expense').length,
    income: occurrences.filter((occurrence) => occurrence.kind === 'income').length,
  }
}

export function RecurrenceCalendar() {
  const today = useMemo(() => new Date(), [])
  const [month, setMonth] = useState(() => startOfMonth(today))
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today)
  const { recurrences: expenses, isLoading: isLoadingExpenses } = useRecurrences('expense')
  const { recurrences: incomes, isLoading: isLoadingIncomes } = useRecurrences('income')
  const { categories: expenseCategories } = useCategories('expense')
  const { categories: incomeCategories } = useCategories('income')

  const expenseById = useMemo(
    () => new Map(expenseCategories.map((category) => [category.id, category])),
    [expenseCategories],
  )
  const incomeById = useMemo(
    () => new Map(incomeCategories.map((category) => [category.id, category])),
    [incomeCategories],
  )

  const occurrences = useMemo(
    () => [
      ...expenses.flatMap((recurrence) =>
        projectRecurrence(
          recurrence,
          'expense',
          expenseById.get(recurrence.category_id),
          month,
        ),
      ),
      ...incomes.flatMap((recurrence) =>
        projectRecurrence(
          recurrence,
          'income',
          incomeById.get(recurrence.category_id),
          month,
        ),
      ),
    ],
    [expenseById, expenses, incomeById, incomes, month],
  )

  const occurrencesByDate = useMemo(() => {
    const grouped = new Map<string, CalendarOccurrence[]>()
    for (const occurrence of occurrences) {
      const key = dateKey(occurrence.date)
      grouped.set(key, [...(grouped.get(key) ?? []), occurrence])
    }
    return grouped
  }, [occurrences])

  const selectedOccurrences = selectedDate
    ? (occurrencesByDate.get(dateKey(selectedDate)) ?? [])
    : []
  const isLoading = isLoadingExpenses || isLoadingIncomes

  function RecurrenceDayButton({ day, modifiers, className, ...props }: DayButtonProps) {
    const dayOccurrences = occurrencesByDate.get(dateKey(day.date)) ?? []
    const summary = occurrenceSummary(dayOccurrences)

    return (
      <DayButton
        day={day}
        modifiers={modifiers}
        className={cn(
          className,
          modifiers.selected && 'border-primary/50 bg-primary/10 text-primary',
          modifiers.today && !modifiers.selected && 'border-primary/30 text-primary',
          modifiers.outside && 'bg-muted/20 text-muted-foreground opacity-60',
          dayOccurrences.length > 0 && 'font-semibold',
        )}
        {...props}
      >
        <span>{day.date.getDate()}</span>
        <span className="mt-auto flex min-h-4 items-center justify-center gap-1">
          {summary.income > 0 && (
            <span
              className="size-2 rounded-full bg-emerald-500"
              aria-label={`${summary.income} ingresos recurrentes`}
            />
          )}
          {summary.expense > 0 && (
            <span
              className="size-2 rounded-full bg-red-500"
              aria-label={`${summary.expense} egresos recurrentes`}
            />
          )}
        </span>
      </DayButton>
    )
  }

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_340px] 2xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="bg-card rounded-lg border p-3 shadow-sm sm:p-5">
        <Calendar
          mode="single"
          locale={es}
          month={month}
          selected={selectedDate}
          onMonthChange={(nextMonth) => {
            const next = startOfMonth(nextMonth)
            setMonth(next)
            setSelectedDate(next)
          }}
          onSelect={setSelectedDate}
          components={{ DayButton: RecurrenceDayButton }}
          footer={isLoading ? 'Cargando recurrencias…' : undefined}
          className="relative"
        />
      </div>

      <aside className="bg-card rounded-lg border p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Día seleccionado
            </p>
            <h2 className="text-lg font-semibold capitalize">
              {selectedDate
                ? selectedDate.toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Sin fecha'}
            </h2>
          </div>
          <CalendarDays className="text-muted-foreground size-5 shrink-0" />
        </div>

        {selectedOccurrences.length === 0 ? (
          <div className="bg-muted/40 rounded-lg border border-dashed px-4 py-8 text-center">
            <p className="text-muted-foreground text-sm">No hay recurrencias para este día.</p>
          </div>
        ) : (
          <ul className="divide-border divide-y">
            {selectedOccurrences.map((occurrence, index) => (
              <li key={`${occurrence.recurrence.id}-${occurrence.kind}-${index}`} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <CategoryIcon
                        name={occurrence.icon}
                        className={cn(
                          'shrink-0',
                          occurrence.kind === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400',
                        )}
                      />
                      <p className="truncate font-medium">{occurrence.name}</p>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {kindLabels[occurrence.kind]} · {describeSchedule(occurrence.recurrence)}
                    </p>
                    {occurrence.recurrence.note && (
                      <p className="text-muted-foreground mt-1 truncate text-sm">
                        {occurrence.recurrence.note}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {formatMinorUnits(occurrence.recurrence.amount_cents)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  )
}
