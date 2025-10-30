import { useMutation } from '@tanstack/react-query'
import { membersApi, DiscordAuthRequest } from '@/api/members'

export function useDiscordAuth() {
  return useMutation({
    mutationFn: (data: DiscordAuthRequest) => membersApi.discordAuth(data),
    onSuccess: (response) => {
      // Store member data in localStorage after Discord auth
      localStorage.setItem('user', JSON.stringify({
        memberId: response.data.id,
        profile: response.data,
        authType: 'discord'
      }))
    },
  })
}

export function useLogout() {
  return () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }
}

export function getStoredUser() {
  try {
    const userData = localStorage.getItem('user')
    return userData ? JSON.parse(userData) : null
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  const user = getStoredUser()
  return !!user && !!user.memberId
}

