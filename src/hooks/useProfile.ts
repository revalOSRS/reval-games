import { useQuery } from '@tanstack/react-query'
import { membersApi } from '@/api/members'
import { getStoredUser } from './useAuth'

export function useProfile() {
  const userData = getStoredUser()

  return useQuery({
    queryKey: ['profile', userData?.profile?.discord_id],
    queryFn: async () => {
      if (!userData?.profile?.discord_id) {
        throw new Error('Kasutaja andmed puuduvad. Palun logi uuesti sisse.')
      }

      // Fetch comprehensive profile data from API
      const response = await membersApi.getPlayerProfile(
        userData.profile.discord_id,
        userData.profile.member_code?.toString()
      )
      
      return response.data
    },
    enabled: !!userData?.profile?.discord_id,
    staleTime: 2 * 60 * 1000, // 2 minutes - refresh more frequently for live data
    retry: 1,
  })
}

