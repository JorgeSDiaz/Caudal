import { api } from '@/api/client'
import type { Profile, UpdateProfileInput } from '@/features/profile/profile'

export async function updateProfile(input: UpdateProfileInput): Promise<Profile> {
  const { data, error } = await api.PUT('/api/v1/profile', { body: input })
  if (error) throw new Error('Failed to update profile')
  return data
}
