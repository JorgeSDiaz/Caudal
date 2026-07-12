import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory } from '@/features/categories/api/create-category'
import { updateCategory } from '@/features/categories/api/update-category'
import type { Category, CategoryKind } from '@/features/categories/category'
import {
  categoryIconOptions,
  type CategoryIconName,
} from '@/features/categories/category-icon-options'
import { CategoryIcon } from '@/features/categories/category-icons'
import { cn } from '@/lib/utils'
import { categoriesMatch } from '@/shared/swr-keys'

const defaultIcon: Record<CategoryKind, CategoryIconName> = {
  expense: 'ShoppingCart',
  income: 'Wallet',
}

export function CategoryForm({
  kind,
  category,
  onSaved,
}: {
  kind: CategoryKind
  category?: Category
  onSaved?: (category: Category) => void
}) {
  const [name, setName] = useState(() => category?.name ?? '')
  const [icon, setIcon] = useState<CategoryIconName>(
    () => (category?.icon as CategoryIconName | null) ?? defaultIcon[kind],
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = category !== undefined
  const canSubmit = name.trim() !== '' && !isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    setIsSubmitting(true)
    try {
      const saved = isEditing
        ? await updateCategory(category.id, { name: name.trim(), icon })
        : await createCategory({ name: name.trim(), icon, kind })
      await mutate(categoriesMatch(kind))
      toast.success(isEditing ? 'Categoría actualizada' : 'Categoría creada')
      onSaved?.(saved)
      if (!isEditing) setName('')
    } catch {
      toast.error(isEditing ? 'No se pudo actualizar la categoría' : 'No se pudo crear la categoría')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Nombre</Label>
        <Input
          id="category-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={kind === 'income' ? 'Dividendos' : 'Impuestos'}
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label>Icono</Label>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
          {categoryIconOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.label}
              aria-label={option.label}
              aria-pressed={icon === option.value}
              onClick={() => setIcon(option.value)}
              className={cn(
                'border-input bg-background hover:bg-accent grid size-10 place-items-center rounded-md border transition-colors',
                icon === option.value && 'border-primary bg-primary/10 text-primary',
              )}
            >
              <CategoryIcon name={option.value} />
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={!canSubmit}>
        {isSubmitting ? 'Guardando…' : isEditing ? 'Guardar cambios' : 'Crear categoría'}
      </Button>
    </form>
  )
}
