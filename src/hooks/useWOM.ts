import { useQuery } from '@tanstack/react-query'
import { womApi } from '@/api/members'

export function useWOMPlayer(username?: string) {
  return useQuery({
    queryKey: ['wom-player', username],
    queryFn: () => womApi.getPlayer(username!),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWOMGains(username?: string, period: 'day' | 'week' | 'month' | 'year' = 'week') {
  return useQuery({
    queryKey: ['wom-gains', username, period],
    queryFn: () => womApi.getPlayerGains(username!, period),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWOMAchievements(username?: string, limit: number = 20) {
  return useQuery({
    queryKey: ['wom-achievements', username, limit],
    queryFn: () => womApi.getPlayerAchievements(username!, limit),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  })
}

export function useWOMComprehensive(username?: string) {
  return useQuery({
    queryKey: ['wom-comprehensive', username],
    queryFn: () => womApi.getComprehensiveData(username!),
    enabled: !!username,
    staleTime: 5 * 60 * 1000,
  })
}

