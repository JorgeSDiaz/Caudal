import { api } from '@/api/client'
import type { components } from '@/api/schema'
import type { Category } from '@/features/categories/category'

export type CreateCategoryPayload = components['schemas']['CreateCategoryRequest']

export async function createCategory(payload: CreateCategoryPayload): Promise<Category> {
  const { data, error } = await api.POST('/api/v1/categories', { body: payload })
  if (error) throw new Error('Failed to create category')
  return data
}
