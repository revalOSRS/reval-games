import { Outlet } from '@tanstack/react-router'
import { useEffect } from 'react'
import { isAuthenticated } from '@/hooks/useAuth'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'

export default function AuthenticatedLayout() {
  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login'
    }
  }, [])

  if (!isAuthenticated()) {
    return null
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 bg-background">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}

