import { api } from '@/api/client'
import type { Category } from '@/features/categories/category'

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await api.GET('/api/v1/categories')
  if (error) throw new Error('Failed to load categories')
  return data
}
