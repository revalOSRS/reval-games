// This file is auto-generated - do not edit manually
import { Route as rootRoute } from './routes/__root'
import { Route as IndexRoute } from './routes/index'
import { Route as AuthenticatedRoute } from './routes/_authenticated'
import { Route as AuthenticatedEventsRoute } from './routes/_authenticated/events'
import { Route as AuthenticatedMenuRoute } from './routes/_authenticated/menu'
import { Route as AuthenticatedProfileRoute } from './routes/_authenticated/profile'
import { Route as AuthenticatedEventBattleshipBingoEventIdRoute } from './routes/_authenticated/event/battleship-bingo.$eventId'

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      preLoaderRoute: typeof IndexRoute
      parentRoute: typeof rootRoute
    }
    '/_authenticated': {
      preLoaderRoute: typeof AuthenticatedRoute
      parentRoute: typeof rootRoute
    }
    '/_authenticated/events': {
      preLoaderRoute: typeof AuthenticatedEventsRoute
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/menu': {
      preLoaderRoute: typeof AuthenticatedMenuRoute
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/profile': {
      preLoaderRoute: typeof AuthenticatedProfileRoute
      parentRoute: typeof AuthenticatedRoute
    }
    '/_authenticated/event/battleship-bingo/$eventId': {
      preLoaderRoute: typeof AuthenticatedEventBattleshipBingoEventIdRoute
      parentRoute: typeof AuthenticatedRoute
    }
  }
}

export const routeTree = rootRoute.addChildren([
  IndexRoute,
  AuthenticatedRoute.addChildren([
    AuthenticatedEventsRoute,
    AuthenticatedMenuRoute,
    AuthenticatedProfileRoute,
    AuthenticatedEventBattleshipBingoEventIdRoute,
  ]),
])

