import { useQuery } from '@tanstack/react-query'
import { membersApi } from '@/api/members'
import { getStoredUser } from './useAuth'

export function useProfile() {
  const userData = getStoredUser()

  return useQuery({
    queryKey: ['profile', userData?.memberId],
    queryFn: async () => {
      if (!userData?.memberId || !userData?.code) {
        throw new Error('Kasutaja andmed puuduvad. Palun logi uuesti sisse.')
      }

      const response = await membersApi.getProfile(userData.memberId, userData.code)
      
      // Update localStorage with fresh profile data
      localStorage.setItem('user', JSON.stringify({
        ...userData,
        profile: response.data
      }))

      return response.data
    },
    enabled: !!userData?.memberId && !!userData?.code,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })
}

