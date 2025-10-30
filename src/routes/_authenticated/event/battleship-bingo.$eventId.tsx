import { createFileRoute } from '@tanstack/react-router'
import BattleshipBingoPage from '@/pages/BattleshipBingoPage'

export const Route = createFileRoute('/_authenticated/event/battleship-bingo/$eventId')({
  component: BattleshipBingoPage,
})

