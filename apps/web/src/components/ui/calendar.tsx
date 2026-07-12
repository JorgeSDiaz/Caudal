import * as React from 'react'
import { DayPicker, DayFlag, SelectionState, UI } from 'react-day-picker'

import { cn } from '@/lib/utils'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  fixedWeeks = true,
  weekStartsOn = 1,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks={fixedWeeks}
      weekStartsOn={weekStartsOn}
      className={cn('w-full', className)}
      classNames={{
        [UI.Months]: 'w-full',
        [UI.Month]: 'w-full space-y-4',
        [UI.MonthCaption]: 'flex h-10 items-center justify-center',
        [UI.CaptionLabel]: 'text-sm font-semibold capitalize',
        [UI.Nav]: 'absolute right-1 top-1 flex items-center gap-1',
        [UI.PreviousMonthButton]:
          'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50',
        [UI.NextMonthButton]:
          'inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-50',
        [UI.Chevron]: 'size-4 fill-current',
        [UI.MonthGrid]: 'w-full table-fixed border-separate border-spacing-1',
        [UI.Weekdays]: 'text-muted-foreground',
        [UI.Weekday]: 'h-8 text-center text-xs font-medium uppercase',
        [UI.Week]: '',
        [UI.Day]: 'relative h-20 rounded-md align-top text-center text-sm sm:h-24',
        [UI.DayButton]:
          'group flex h-full w-full flex-col items-center justify-start rounded-md border border-border/60 bg-background px-1.5 py-2 text-sm outline-none transition-colors hover:bg-accent focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
        [DayFlag.today]: 'text-primary',
        [DayFlag.outside]: 'text-muted-foreground opacity-45',
        [SelectionState.selected]: 'bg-primary/10 text-primary',
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }
