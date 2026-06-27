import { api } from '@/api/client'
import type { BackupDocument } from '@/features/expenses/expense'

/** Fetch the full backup document (every expense) from the API. */
export async function fetchBackup(): Promise<BackupDocument> {
  const { data, error } = await api.GET('/api/v1/backup')
  if (error) throw new Error('Failed to export backup')
  return data
}

/** Restore a backup document; returns how many expenses were imported. */
export async function restoreBackup(document: BackupDocument): Promise<number> {
  const { data, error } = await api.POST('/api/v1/backup', { body: document })
  if (error) throw new Error('Failed to import backup')
  return data.imported ?? 0
}
