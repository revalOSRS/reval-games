import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { isAuthenticated } from '@/hooks/useAuth'

export const Route = createRootRoute({
  component: () => <Outlet />,
  beforeLoad: async ({ location }) => {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/liikmed']
    
    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated() && !publicRoutes.includes(location.pathname)) {
      throw redirect({ to: '/login' })
    }
  },
})

