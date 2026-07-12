import { api } from '@/api/client'

export async function deleteCategory(categoryId: number): Promise<void> {
  const { error } = await api.DELETE('/api/v1/categories/{category_id}', {
    params: { path: { category_id: categoryId } },
  })
  if (error) throw new Error('Failed to delete category')
}
