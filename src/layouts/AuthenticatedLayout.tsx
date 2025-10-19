import { Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { isAuthenticated } from '@/hooks/useAuth'

export default function AuthenticatedLayout() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/' })
    }
  }, [navigate])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

