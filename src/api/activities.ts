import { api } from './client'

export interface ActivityEvent {
  id: string
  event_type: string
  icon: string
  text: string
  player_name?: string
  created_at: string
}

export interface ActivityEventsResponse {
  status: 'success' | 'error'
  data: ActivityEvent[]
  count: number
  message?: string
}

// WOM Activity types
export interface WOMActivity {
  groupId: number
  playerId: number
  type: string
  role: string | null
  previousRole: string | null
  createdAt: string
  player: {
    id: number
    username: string
    displayName: string
    type: string
    build: string
    status: string
    exp: number
    ehp: number
    ehb: number
  }
}

export interface WOMActivityResponse {
  status: 'success' | 'error'
  data: WOMActivity[]
  count: number
  message?: string
}

export const activityApi = {
  getRecentActivities: async (): Promise<ActivityEventsResponse> => {
    try {
      const response = await api.get<ActivityEventsResponse>('/activity-events')
      return response
    } catch (error) {
      console.error('Failed to fetch activity events:', error)
      return {
        status: 'error',
        data: [],
        count: 0,
        message: 'Failed to fetch activities',
      }
    }
  },

  getClanActivity: async (limit: number = 7): Promise<WOMActivityResponse> => {
    try {
      const response = await api.get<WOMActivityResponse>(`/wom/clan/activity?limit=${limit}`)
      return response
    } catch (error) {
      console.error('Failed to fetch clan activity:', error)
      return {
        status: 'error',
        data: [],
        count: 0,
        message: 'Failed to fetch clan activity',
      }
    }
  },
}

