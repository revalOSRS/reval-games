import { api } from './client'

export interface WOMGroupMember {
  player: {
    id: number
    username: string
    displayName: string
    type: string
    build: string
    status: string
    patron: boolean
    exp: number
    ehp: number
    ehb: number
    ttm: number
    tt200m: number
    registeredAt: string
    updatedAt: string
  }
  role: string
  joinedAt: string
}

export interface WOMGroupMembersResponse {
  status: 'success' | 'error'
  data: WOMGroupMember[]
  count: number
  message?: string
}

export const womGroupApi = {
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
}

