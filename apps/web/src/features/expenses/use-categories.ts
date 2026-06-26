import useSWR from 'swr'

import { api } from '@/api/client'
import type { components } from '@/api/schema'

export type Category = components['schemas']['CategoryResponse']

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await api.GET('/api/v1/categories')
  if (error) throw new Error('Failed to load categories')
  return data
}

/** SWR handles deduplication and caching of the categories request. */
export function useCategories() {
  const { data, error, isLoading } = useSWR('categories', fetchCategories)
  return { categories: data ?? [], error, isLoading }
}
