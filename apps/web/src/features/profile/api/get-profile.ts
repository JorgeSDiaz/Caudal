import { api } from '@/api/client'
import type { Profile } from '@/features/profile/profile'

export async function getProfile(): Promise<Profile> {
  const { data, error } = await api.GET('/api/v1/profile')
  if (error) throw new Error('Failed to load profile')
  return data
}
