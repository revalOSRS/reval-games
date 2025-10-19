import { createRoute } from '@tanstack/react-router'
import { Route as AuthRoute } from '../_authenticated'
import ProfilePage from '@/pages/ProfilePage'

export const Route = createRoute({
  getParentRoute: () => AuthRoute,
  path: '/profile',
  component: ProfilePage,
})

