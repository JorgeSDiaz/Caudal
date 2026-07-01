import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function ListPagination({
  offset,
  visible,
  total,
  page,
  pageCount,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: {
  offset: number
  visible: number
  total: number
  page: number
  pageCount: number
  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void
}) {
  const first = offset + 1
  const last = offset + visible

  return (
    <div className="flex items-center justify-between gap-3 pt-1">
      <p className="text-muted-foreground text-sm tabular-nums">
        {first}-{last} de {total}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm tabular-nums">
          {page}/{pageCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          aria-label="Página anterior"
        >
          <ChevronLeft />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Página siguiente"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  )
}
