import { createRoute } from '@tanstack/react-router'
import { Route as AuthRoute } from '../_authenticated'
import ActiveEventsPage from '@/pages/ActiveEventsPage'

export const Route = createRoute({
  getParentRoute: () => AuthRoute,
  path: '/events',
  component: ActiveEventsPage,
})

