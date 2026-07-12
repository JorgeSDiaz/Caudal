import { api } from '@/api/client'
import type { components } from '@/api/schema'
import type { Category } from '@/features/categories/category'

export type UpdateCategoryPayload = components['schemas']['UpdateCategoryRequest']

export async function updateCategory(
  categoryId: number,
  payload: UpdateCategoryPayload,
): Promise<Category> {
  const { data, error } = await api.PATCH('/api/v1/categories/{category_id}', {
    params: { path: { category_id: categoryId } },
    body: payload,
  })
  if (error) throw new Error('Failed to update category')
  return data
}
