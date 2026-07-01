import { CalendarClock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { deleteRecurrence } from '@/features/recurrences/api/delete-recurrence'
import { describeSchedule, formatShortDay } from '@/features/recurrences/describe'
import { useRecurrences } from '@/features/recurrences/hooks/use-recurrences'
import type { Recurrence, RecurrenceKind } from '@/features/recurrences/recurrence'
import { formatMinorUnits } from '@/shared/money'
import { recurrencesKey } from '@/shared/swr-keys'

export function RecurrenceList({ kind }: { kind: RecurrenceKind }) {
  const { recurrences, isLoading } = useRecurrences(kind)
  const { categories } = useCategories(kind)

  if (isLoading) {
    return <p className="text-muted-foreground text-sm">Cargando…</p>
  }
  if (recurrences.length === 0) {
    return (
      <div className="bg-muted/50 flex min-h-28 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-center">
        <CalendarClock className="text-muted-foreground size-5" />
        <p className="text-muted-foreground text-sm">Aún no hay recurrencias.</p>
      </div>
    )
  }

  const names = new Map(categories.map((category) => [category.id, category.name]))

  return (
    <ul className="divide-border divide-y">
      {recurrences.map((recurrence) => (
        <RecurrenceRow
          key={recurrence.id}
          recurrence={recurrence}
          name={names.get(recurrence.category_id) ?? '—'}
          kind={kind}
        />
      ))}
    </ul>
  )
}

function RecurrenceRow({
  recurrence,
  name,
  kind,
}: {
  recurrence: Recurrence
  name: string
  kind: RecurrenceKind
}) {
  async function handleDelete() {
    try {
      await deleteRecurrence(recurrence.id)
      await mutate(recurrencesKey(kind))
      toast.success('Recurrencia eliminada')
    } catch {
      toast.error('No se pudo eliminar la recurrencia')
    }
  }

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate font-medium">{name}</p>
        <p className="text-muted-foreground truncate text-sm">
          {describeSchedule(recurrence)}
          {recurrence.next_occurrence_on
            ? ` · próximo ${formatShortDay(recurrence.next_occurrence_on)}`
            : ''}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <span className="font-semibold tabular-nums">
          {formatMinorUnits(recurrence.amount_cents)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Eliminar recurrencia de ${name}`}
          onClick={handleDelete}
        >
          <Trash2 className="text-muted-foreground" />
        </Button>
      </div>
    </li>
  )
}
