import { createRoute } from '@tanstack/react-router'
import { Route as RootRoute } from './__root'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  id: '_authenticated',
  component: AuthenticatedLayout,
})

