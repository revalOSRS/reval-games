import { createFileRoute, redirect } from '@tanstack/react-router'
import AdminPage from '@/pages/AdminPage'
import { getStoredUser } from '@/hooks/useAuth'

const ADMIN_DISCORD_ID = '603849391970975744'

export const Route = createFileRoute('/_authenticated/admin')({
  beforeLoad: () => {
    const user = getStoredUser()
    if (user?.profile?.discord_id !== ADMIN_DISCORD_ID) {
      throw redirect({ to: '/' })
    }
  },
  component: AdminPage,
})


