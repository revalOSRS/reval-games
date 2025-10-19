import { createRoute } from '@tanstack/react-router'
import { Route as AuthRoute } from '../_authenticated'
import MenuPage from '@/pages/MenuPage'

export const Route = createRoute({
  getParentRoute: () => AuthRoute,
  path: '/menu',
  component: MenuPage,
})

