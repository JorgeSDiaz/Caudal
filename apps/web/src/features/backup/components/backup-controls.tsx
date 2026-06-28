import { Download, EllipsisVertical, Upload } from 'lucide-react'
import { type ChangeEvent, useRef, useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { fetchBackup, restoreBackup } from '@/features/backup/api/backup'
import type { BackupDocument } from '@/features/backup/backup'
import { todayIso } from '@/shared/dates'

/** Minimal shape check before trusting a user-provided file as a backup. */
function isBackupDocument(value: unknown): value is BackupDocument {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { expenses?: unknown }).expenses)
  )
}

export function BackupControls() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  async function handleExport() {
    setIsExporting(true)
    try {
      const backup = await fetchBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `caudal-${todayIso()}.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Respaldo descargado')
    } catch {
      toast.error('No se pudo exportar el respaldo')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Reset so selecting the same file again re-triggers onChange.
    event.target.value = ''
    if (!file) return

    setIsImporting(true)
    try {
      const parsed: unknown = JSON.parse(await file.text())
      if (!isBackupDocument(parsed)) {
        toast.error('El archivo no es un respaldo válido')
        return
      }
      const imported = await restoreBackup(parsed)
      // Imported records can land in any month — revalidate every cache key.
      await mutate(() => true)
      toast.success(`${imported} ${imported === 1 ? 'registro importado' : 'registros importados'}`)
    } catch {
      toast.error('No se pudo importar el respaldo')
    } finally {
      setIsImporting(false)
    }
  }

  const isBusy = isExporting || isImporting

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isBusy} aria-label="Respaldo de datos">
            <EllipsisVertical className="text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onCloseAutoFocus={(event) => event.preventDefault()}>
          <DropdownMenuLabel>Respaldo</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleExport} disabled={isExporting}>
            <Download />
            Exportar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => fileInputRef.current?.click()} disabled={isImporting}>
            <Upload />
            Importar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImport}
      />
    </>
  )
}
