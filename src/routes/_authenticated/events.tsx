import { createFileRoute } from '@tanstack/react-router'
import ActiveEventsPage from '@/pages/ActiveEventsPage'

export const Route = createFileRoute('/_authenticated/events')({
  component: ActiveEventsPage,
})

