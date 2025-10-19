import { Outlet } from '@tanstack/react-router'

export default function UnauthenticatedLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  )
}

