import { api } from './client'

export interface MemberProfile {
  id: number
  discord_id: string
  discord_tag: string
  member_code: number
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
    wom: {
      player: WOMPlayer | null
      gains: WOMGains | null
      achievements: WOMAchievement[]
      records: WOMRecord[]
      groups: any[]
    }
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
}

