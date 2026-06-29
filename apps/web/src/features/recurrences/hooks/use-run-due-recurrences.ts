import { useEffect, useRef } from 'react'
import { mutate } from 'swr'

import { runRecurrences } from '@/features/recurrences/api/run-recurrences'

/** On first mount, materialize any due recurrences and refresh caches if any were created. */
export function useRunDueRecurrences() {
  const ran = useRef(false)
  useEffect(() => {
    if (ran.current) return // guard against StrictMode's double-invoke
    ran.current = true
    runRecurrences()
      .then((generated) => {
        if (generated > 0) void mutate(() => true)
      })
      .catch(() => {
        // A failed materialization shouldn't break the app; it retries next load.
      })
  }, [])
}
