import useSWR from 'swr'

import { listCategories } from '@/features/categories/api/list-categories'

/** SWR handles deduplication and caching of the categories request. */
export function useCategories() {
  const { data, error, isLoading } = useSWR('categories', listCategories)
  return { categories: data ?? [], error, isLoading }
}
