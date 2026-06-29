import useSWR from 'swr'

import { listRecurrences } from '@/features/recurrences/api/list-recurrences'
import type { RecurrenceKind } from '@/features/recurrences/recurrence'
import { recurrencesKey } from '@/shared/swr-keys'

export function useRecurrences(kind: RecurrenceKind) {
  const { data, error, isLoading } = useSWR(recurrencesKey(kind), () => listRecurrences(kind))
  return { recurrences: data ?? [], error, isLoading }
}
