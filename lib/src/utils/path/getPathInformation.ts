import regexparam from 'regexparam'
import { parsePaths } from './parsePaths'

export function getPathInformation(routes: RouteConfig[]): Route[] {
  const allRoutes = parsePaths(routes)
  return allRoutes.map((route) => {
    const { pattern, keys } = regexparam(route.path as string)
    route.regexpPath = pattern
    route.pathKeys = keys
    return route
  })
}
