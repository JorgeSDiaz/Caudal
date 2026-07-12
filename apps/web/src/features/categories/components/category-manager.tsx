import { Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Category, CategoryKind } from '@/features/categories/category'
import { CategoryIcon } from '@/features/categories/category-icons'
import { CategoryForm } from '@/features/categories/components/category-form'
import { deleteCategory } from '@/features/categories/api/delete-category'
import { updateCategory } from '@/features/categories/api/update-category'
import { useCategories } from '@/features/categories/hooks/use-categories'
import { cn } from '@/lib/utils'
import { categoriesMatch } from '@/shared/swr-keys'

const labels: Record<CategoryKind, { tab: string; title: string; empty: string }> = {
  expense: {
    tab: 'Gastos',
    title: 'Categorías de gastos',
    empty: 'No hay categorías de gastos.',
  },
  income: {
    tab: 'Ingresos',
    title: 'Fuentes de ingresos',
    empty: 'No hay fuentes de ingresos.',
  },
}

export function CategoryManager() {
  const [kind, setKind] = useState<CategoryKind>('expense')

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground text-sm">
            Personaliza la clasificación de gastos e ingresos.
          </p>
        </div>
        <div className="bg-muted flex rounded-lg p-1">
          {(['expense', 'income'] as CategoryKind[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              className={cn(
                'h-9 rounded-md px-3 text-sm font-medium transition-colors',
                kind === option
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {labels[option].tab}
            </button>
          ))}
        </div>
      </div>

      <CategoryPanel kind={kind} />
    </div>
  )
}

function CategoryPanel({ kind }: { kind: CategoryKind }) {
  const { categories, isLoading } = useCategories(kind, true)
  const [isCreating, setIsCreating] = useState(false)

  return (
    <section className="bg-card rounded-lg border shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <h2 className="font-semibold">{labels[kind].title}</h2>
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus />
              Nueva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva categoría</DialogTitle>
              <DialogDescription>
                Agrega una opción personalizada para clasificar movimientos.
              </DialogDescription>
            </DialogHeader>
            <CategoryForm kind={kind} onSaved={() => setIsCreating(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-4 sm:p-5">
        {isLoading ? (
          <p className="text-muted-foreground text-sm">Cargando…</p>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">{labels[kind].empty}</p>
        ) : (
          <ul className="divide-border divide-y">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} kind={kind} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function CategoryRow({ category, kind }: { category: Category; kind: CategoryKind }) {
  const [isEditing, setIsEditing] = useState(false)
  const canDeactivate = !category.is_system && category.is_active
  const canRestore = !category.is_active

  async function revalidate() {
    await mutate(categoriesMatch(kind))
  }

  async function handleDeactivate() {
    try {
      await deleteCategory(category.id)
      await revalidate()
      toast.success('Categoría desactivada')
    } catch {
      toast.error('No se pudo desactivar la categoría')
    }
  }

  async function handleRestore() {
    try {
      await updateCategory(category.id, { is_active: true })
      await revalidate()
      toast.success('Categoría restaurada')
    } catch {
      toast.error('No se pudo restaurar la categoría')
    }
  }

  return (
    <li
      className={cn(
        'flex items-center justify-between gap-3 py-3',
        !category.is_active && 'opacity-60',
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="bg-muted grid size-9 shrink-0 place-items-center rounded-md">
          <CategoryIcon name={category.icon} className="text-muted-foreground" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium">{category.name}</p>
          <p className="text-muted-foreground text-xs">
            {category.is_system ? 'Sistema' : 'Personalizada'} ·{' '}
            {category.is_active ? 'Activa' : 'Inactiva'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" aria-label={`Editar ${category.name}`}>
              <Pencil className="text-muted-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar categoría</DialogTitle>
              <DialogDescription>Ajusta nombre e icono.</DialogDescription>
            </DialogHeader>
            <CategoryForm
              kind={kind}
              category={category}
              onSaved={() => setIsEditing(false)}
            />
          </DialogContent>
        </Dialog>

        {canRestore ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Restaurar ${category.name}`}
            onClick={handleRestore}
          >
            <RotateCcw className="text-muted-foreground" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Desactivar ${category.name}`}
            onClick={handleDeactivate}
            disabled={!canDeactivate}
          >
            <Trash2 className="text-muted-foreground" />
          </Button>
        )}
      </div>
    </li>
  )
}
