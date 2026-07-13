import useSWR from 'swr'

import { getProfile } from '@/features/profile/api/get-profile'
import { updateProfile } from '@/features/profile/api/update-profile'
import type { UpdateProfileInput } from '@/features/profile/profile'
import { profileKey } from '@/shared/swr-keys'

export function useProfile() {
  const { data, error, isLoading, mutate } = useSWR(profileKey, getProfile)

  return {
    profile: data,
    error,
    isLoading,
    save: async (input: UpdateProfileInput) => {
      const saved = await updateProfile(input)
      await mutate(saved, { revalidate: false })
      return saved
    },
  }
}
