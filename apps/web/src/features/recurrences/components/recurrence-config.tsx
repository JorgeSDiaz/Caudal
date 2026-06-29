import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { Frequency } from '@/features/recurrences/recurrence'
import type { RecurrenceConfigValue } from '@/features/recurrences/recurrence-config'
import { cn } from '@/lib/utils'

const frequencies: { value: Frequency; label: string }[] = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'biweekly', label: 'Quincenal' },
]

function clampDay(raw: string): number {
  const day = Number(raw.replace(/\D/g, ''))
  if (day < 1) return 1
  if (day > 31) return 31
  return day
}

function DayInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (day: number) => void
}) {
  return (
    <div className="flex-1 space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input
        inputMode="numeric"
        value={String(value)}
        onChange={(event) => onChange(clampDay(event.target.value))}
        className="h-9"
      />
    </div>
  )
}

export function RecurrenceConfig({
  value,
  onChange,
}: {
  value: RecurrenceConfigValue
  onChange: (next: RecurrenceConfigValue) => void
}) {
  const set = (patch: Partial<RecurrenceConfigValue>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium select-none">
        <input
          type="checkbox"
          className="accent-primary size-4"
          checked={value.recurring}
          onChange={(event) => set({ recurring: event.target.checked })}
        />
        Repetir automáticamente
      </label>

      {value.recurring && (
        <div className="bg-muted/40 space-y-3 rounded-lg border p-3">
          <div className="bg-muted grid grid-cols-2 gap-1 rounded-md p-1">
            {frequencies.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => set({ frequency: option.value })}
                className={cn(
                  'rounded py-1 text-xs font-medium transition-colors',
                  value.frequency === option.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <DayInput
              label={value.frequency === 'biweekly' ? 'Primer día' : 'Día del mes'}
              value={value.dayOfMonth}
              onChange={(day) => set({ dayOfMonth: day })}
            />
            {value.frequency === 'biweekly' && (
              <DayInput
                label="Segundo día"
                value={value.secondDayOfMonth}
                onChange={(day) => set({ secondDayOfMonth: day })}
              />
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="recurrence-end" className="text-xs">
              Hasta (opcional)
            </Label>
            <Input
              id="recurrence-end"
              type="date"
              value={value.endDate}
              onChange={(event) => set({ endDate: event.target.value })}
              className="h-9"
            />
          </div>
        </div>
      )}
    </div>
  )
}
