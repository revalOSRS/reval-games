import { createRoute } from '@tanstack/react-router'
import { Route as AuthRoute } from '../../_authenticated'
import BattleshipBingoPage from '@/pages/BattleshipBingoPage'

export const Route = createRoute({
  getParentRoute: () => AuthRoute,
  path: '/event/battleship-bingo/$eventId',
  component: BattleshipBingoPage,
})

