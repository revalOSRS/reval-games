import { api } from './client'

export interface MemberProfile {
  id: number
  discord_id: string
  discord_tag: string
  discord_avatar?: string
  member_code: number
  token_balance: number
  is_active: boolean
  created_at?: string
  last_seen?: string
}

export interface OSRSAccount {
  id: number
  discord_id: string
  osrs_nickname: string
  dink_hash?: string
  wom_player_id?: number
  wom_rank?: string
  ehp: number
  ehb: number
  is_primary: boolean
  created_at: string
}

export interface Donation {
  id: number
  discord_id: string
  amount: number
  status: string
  screenshot_url?: string
  submitted_at?: string
  created_at: string
  approved_at?: string
  approved_by?: string
}

export interface WOMPlayer {
  id: number
  username: string
  displayName: string
  type: string
  build: string
  exp: number
  ehp: number
  ehb: number
  updatedAt: string
}

export interface WOMGains {
  startsAt: string
  endsAt: string
  data: {
    skills: Record<string, { gained: number; start: number; end: number }>
    bosses: Record<string, { gained: number; start: number; end: number }>
    computed: {
      ehp: { gained: number; start: number; end: number }
      ehb: { gained: number; start: number; end: number }
    }
  }
}

export interface WOMAchievement {
  playerId: number
  name: string
  metric: string
  measure: string
  threshold: number
  createdAt: string
}

export interface WOMRecord {
  id: number
  playerId: number
  period: string
  metric: string
  value: number
  updatedAt: string
}

export interface TokenMovement {
  id: number
  discord_id: string
  amount: number
  description: string
  created_at: string
}

export interface PlayerProfileResponse {
  status: 'success'
  data: {
    member: MemberProfile
    osrs_accounts: OSRSAccount[]
    donations: {
      total_approved: number
      total_pending: number
      recent: Donation[]
    }
    token_movements: TokenMovement[]
  }
}

export interface LoginResponse {
  status: 'success'
  data: MemberProfile
  message: string
}

export interface MemberProfileResponse {
  status: 'success'
  data: MemberProfile
}

export interface LoginRequest {
  code: string
}

export interface DiscordAuthRequest {
  code: string
}

export interface DiscordAuthResponse {
  status: 'success'
  data: MemberProfile
  message: string
}

export interface AdminMember {
  id: string
  discord_id: string
  discord_tag: string
  discord_avatar?: string
  member_code: string
  token_balance: number
  is_active: boolean
  osrs_accounts_count: number
  total_donations: number
  created_at: string
}

export interface AdminMembersResponse {
  status: 'success' | 'error'
  data: AdminMember[]
  count: number
}

export const membersApi = {
  discordAuth: async (data: DiscordAuthRequest): Promise<DiscordAuthResponse> => {
    return api.post<DiscordAuthResponse>('/auth/discord', data)
  },

  getPlayerProfile: async (discordId: string, code?: string): Promise<PlayerProfileResponse> => {
    const options: RequestInit = code 
      ? { headers: { 'x-member-code': code } } 
      : {}
    return api.get<PlayerProfileResponse>(`/player/${discordId}`, options)
  },

  getAllMembers: async (): Promise<AdminMembersResponse> => {
    const adminKey = import.meta.env.VITE_ADMIN_API_KEY
    return api.get<AdminMembersResponse>('/admin/members/all', {
      headers: {
        'x-admin-key': adminKey || ''
      }
    })
  },

  getActiveMemberCount: async (): Promise<{ status: 'success' | 'error', data?: { active_members: number }, message?: string }> => {
    return api.get('/members/count/active')
  }
}

// WOM API Response types
export interface WOMPlayerResponse {
  status: 'success'
  data: any // Player data structure
}

export interface WOMGainsResponse {
  status: 'success'
  data: any // Gains data structure
}

export interface WOMAchievementsResponse {
  status: 'success'
  data: WOMAchievement[]
}

export interface WOMComprehensiveResponse {
  status: 'success'
  data: {
    player: any
    gains: any
    achievements: WOMAchievement[]
    records: WOMRecord[]
    groups: any[]
  }
}

// WOM API functions
export const womApi = {
  getPlayer: async (username: string): Promise<WOMPlayerResponse> => {
    return api.get(`/wom/player/${username}`)
  },

  getPlayerGains: async (username: string, period: 'day' | 'week' | 'month' | 'year' = 'week'): Promise<WOMGainsResponse> => {
    return api.get(`/wom/player/${username}/gains?period=${period}`)
  },

  getPlayerAchievements: async (username: string, limit: number = 20): Promise<WOMAchievementsResponse> => {
    return api.get(`/wom/player/${username}/achievements?limit=${limit}`)
  },

  getPlayerRecords: async (username: string, period: string = 'week', metric?: string): Promise<any> => {
    const params = metric ? `?period=${period}&metric=${metric}` : `?period=${period}`
    return api.get(`/wom/player/${username}/records${params}`)
  },

  getComprehensiveData: async (username: string): Promise<WOMComprehensiveResponse> => {
    return api.get(`/wom/player/${username}/comprehensive`)
  },
}

