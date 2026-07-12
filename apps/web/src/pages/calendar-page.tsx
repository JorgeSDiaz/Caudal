import { RecurrenceCalendar } from '@/features/recurrences/components/recurrence-calendar'

export function CalendarPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Calendario</h1>
      </div>
      <RecurrenceCalendar />
    </div>
  )
}
