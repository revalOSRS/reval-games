import { createFileRoute } from '@tanstack/react-router'
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout'

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
})

