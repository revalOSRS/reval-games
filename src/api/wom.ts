import { api } from './client'

export interface WOMPlayer {
  id: number
  username: string
  displayName: string
  type: string
  build: string
  status: string
  country: string | null
  patron: boolean
  exp: number
  ehp: number
  ehb: number
  ttm: number
  tt200m: number
  registeredAt: string
  updatedAt: string
  lastChangedAt: string
}

export interface WOMPlayerResponse {
  status: 'success' | 'error'
  data: WOMPlayer
  message?: string
}

export interface WOMGains {
  skills: Record<string, {
    metric: string
    experience: { start: number; end: number; gained: number }
    rank: { start: number; end: number; gained: number }
    level: { start: number; end: number; gained: number }
  }>
  bosses: Record<string, {
    metric: string
    kills: { start: number; end: number; gained: number }
    rank: { start: number; end: number; gained: number }
  }>
}

export interface WOMGainsResponse {
  status: 'success' | 'error'
  data: WOMGains
  message?: string
}

export interface WOMAchievement {
  playerId: number
  name: string
  metric: string
  measure: string
  threshold: number
  createdAt: string
  accuracy?: number
}

export interface WOMAchievementsResponse {
  status: 'success' | 'error'
  data: WOMAchievement[]
  count: number
  message?: string
}

export interface WOMComprehensiveData {
  player: WOMPlayer
  recentGains: WOMGains
  recentAchievements: WOMAchievement[]
}

export interface WOMComprehensiveResponse {
  status: 'success' | 'error'
  data: WOMComprehensiveData
  message?: string
}

export interface WOMGroupStatistics {
  averageStats: {
    totalLevel: number
    totalXP: number
  }
  maxedCount: number
  totalMembers: number
}

export interface WOMGroupStatisticsResponse {
  status: 'success' | 'error'
  data: WOMGroupStatistics
  message?: string
}

export interface WOMGroupMember {
  player: WOMPlayer
  role: string
  joinedAt: string
}

export interface WOMGroupMembersResponse {
  status: 'success' | 'error'
  data: WOMGroupMember[]
  count: number
  message?: string
}

export interface WOMClanStatistics {
  groupName: string
  totalMembers: number
  averageLevel: number
  averageXP: number
  maxedPlayers: {
    count: number
    percentage: number
  }
  totalStats: {
    clues: number
    bossKills: number
    cox: number
    toa: number
    tob: number
    ehp: number
    ehb: number
  }
}

export interface WOMClanStatisticsResponse {
  status: 'success' | 'error'
  data: WOMClanStatistics
  message?: string
}

export const womApi = {
  getPlayer: async (username: string): Promise<WOMPlayerResponse> => {
    try {
      const response = await api.get<WOMPlayerResponse>(`/wom/player/${username}`)
      return response
    } catch (error) {
      console.error('Failed to fetch WOM player:', error)
      return {
        status: 'error',
        data: {} as WOMPlayer,
        message: 'Failed to fetch player data',
      }
    }
  },

  getPlayerGains: async (username: string, period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<WOMGainsResponse> => {
    try {
      const response = await api.get<WOMGainsResponse>(`/wom/player/${username}/gains?period=${period}`)
      return response
    } catch (error) {
      console.error('Failed to fetch WOM gains:', error)
      return {
        status: 'error',
        data: {} as WOMGains,
        message: 'Failed to fetch gains data',
      }
    }
  },

  getPlayerAchievements: async (username: string, limit: number = 5): Promise<WOMAchievementsResponse> => {
    try {
      const response = await api.get<WOMAchievementsResponse>(`/wom/player/${username}/achievements?limit=${limit}`)
      return response
    } catch (error) {
      console.error('Failed to fetch WOM achievements:', error)
      return {
        status: 'error',
        data: [],
        count: 0,
        message: 'Failed to fetch achievements',
      }
    }
  },

  getComprehensiveData: async (username: string): Promise<WOMComprehensiveResponse> => {
    try {
      const response = await api.get<WOMComprehensiveResponse>(`/wom/player/${username}/comprehensive`)
      return response
    } catch (error) {
      console.error('Failed to fetch comprehensive WOM data:', error)
      return {
        status: 'error',
        data: {} as WOMComprehensiveData,
        message: 'Failed to fetch comprehensive data',
      }
    }
  },

  getGroupMembers: async (): Promise<WOMGroupMembersResponse> => {
    try {
      const response = await api.get<WOMGroupMembersResponse>('/wom/clan/members')
      return response
    } catch (error) {
      console.error('Failed to fetch WOM group members:', error)
      return {
        status: 'error',
        data: [],
        count: 0,
        message: 'Failed to fetch group members',
      }
    }
  },

  getClanStatistics: async (): Promise<WOMClanStatisticsResponse> => {
    try {
      const response = await api.get<WOMClanStatisticsResponse>('/wom/clan/statistics')
      return response
    } catch (error) {
      console.error('Failed to fetch clan statistics:', error)
      return {
        status: 'error',
        data: {} as WOMClanStatistics,
        message: 'Failed to fetch clan statistics',
      }
    }
  },
}

