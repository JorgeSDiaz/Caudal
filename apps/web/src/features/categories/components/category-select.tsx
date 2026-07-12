import { Plus } from 'lucide-react'
import { useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CategoryKind } from '@/features/categories/category'
import { CategoryIcon } from '@/features/categories/category-icons'
import { CategoryForm } from '@/features/categories/components/category-form'
import { useCategories } from '@/features/categories/hooks/use-categories'

// Valor centinela: al elegirlo se abre el modal en vez de fijarse como categoría seleccionada.
const CREATE_VALUE = '__create__'

export function CategorySelect({
  id,
  kind,
  value,
  onChange,
  disabled,
}: {
  id: string
  kind: CategoryKind
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  const [isCreating, setIsCreating] = useState(false)
  const { categories, isLoading } = useCategories(kind)
  const noun = kind === 'income' ? 'fuente' : 'categoría'

  function handleValueChange(next: string) {
    if (next === CREATE_VALUE) {
      setIsCreating(true)
      return
    }
    onChange(next)
  }

  return (
    <>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled || isLoading}>
        <SelectTrigger id={id} className="!h-11 w-full">
          <SelectValue placeholder={`Elige una ${noun}`} />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={String(category.id)}>
              <span className="flex min-w-0 items-center gap-2">
                <CategoryIcon name={category.icon} className="text-muted-foreground shrink-0" />
                <span className="truncate">{category.name}</span>
              </span>
            </SelectItem>
          ))}
          <SelectItem value={CREATE_VALUE} className="text-primary mt-1 border-t">
            <span className="flex items-center gap-2">
              <Plus className="size-3.5" />
              Nueva {noun}
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva {noun}</DialogTitle>
            <DialogDescription>
              Crea una opción personalizada para clasificar movimientos con más detalle.
            </DialogDescription>
          </DialogHeader>
          <CategoryForm
            kind={kind}
            onSaved={(category) => {
              onChange(String(category.id))
              setIsCreating(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
