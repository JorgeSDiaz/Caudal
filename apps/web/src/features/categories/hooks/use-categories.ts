import useSWR from 'swr'

import { listCategories } from '@/features/categories/api/list-categories'
import type { CategoryKind } from '@/features/categories/category'

/** SWR handles deduplication and caching, keyed per kind (expense vs income). */
export function useCategories(kind: CategoryKind = 'expense') {
  const { data, error, isLoading } = useSWR(['categories', kind], () => listCategories(kind))
  return { categories: data ?? [], error, isLoading }
}
