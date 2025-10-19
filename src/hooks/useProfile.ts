import { useQuery } from '@tanstack/react-query'
import { getStoredUser } from './useAuth'

export function useProfile() {
  const userData = getStoredUser()

  return useQuery({
    queryKey: ['profile', userData?.memberId],
    queryFn: async () => {
      if (!userData?.memberId || !userData?.profile) {
        throw new Error('Kasutaja andmed puuduvad. Palun logi uuesti sisse.')
      }

      // Return profile from localStorage for Discord auth
      return userData.profile
    },
    enabled: !!userData?.memberId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

