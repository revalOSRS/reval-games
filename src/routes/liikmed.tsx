import { createFileRoute } from '@tanstack/react-router'
import { MembersPage } from '@/pages/MembersPage'

export const Route = createFileRoute('/liikmed')({
  component: MembersPage,
})

