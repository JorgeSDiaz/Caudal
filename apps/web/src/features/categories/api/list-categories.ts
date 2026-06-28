import { api } from '@/api/client'
import type { Category, CategoryKind } from '@/features/categories/category'

export async function listCategories(kind: CategoryKind): Promise<Category[]> {
  const { data, error } = await api.GET('/api/v1/categories', {
    params: { query: { kind } },
  })
  if (error) throw new Error('Failed to load categories')
  return data
}
