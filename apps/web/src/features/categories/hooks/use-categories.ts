import useSWR from 'swr'

import { listCategories } from '@/features/categories/api/list-categories'
import type { CategoryKind } from '@/features/categories/category'
import { categoriesKey } from '@/shared/swr-keys'

/** SWR handles deduplication and caching, keyed per kind (expense vs income). */
export function useCategories(kind: CategoryKind = 'expense', includeInactive = false) {
  const { data, error, isLoading } = useSWR(categoriesKey(kind, includeInactive), () =>
    listCategories(kind, includeInactive),
  )
  return { categories: data ?? [], error, isLoading }
}
