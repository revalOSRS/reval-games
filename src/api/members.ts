import { api } from './client'

export interface MemberProfile {
  id: number
  name: string
  osrsName?: string
  totalLevel?: number
  combatLevel?: number
  joinDate?: string
  is_active?: boolean
  [key: string]: any
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

export const membersApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginResponse>('/login', data)
  },

  getProfile: async (memberId: number, code: string): Promise<MemberProfileResponse> => {
    return api.get<MemberProfileResponse>(
      `/member/${memberId}?code=${code}`
    )
  },
}

