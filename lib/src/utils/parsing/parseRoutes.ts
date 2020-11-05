import { getRoutesTreeChain } from './getRoutesTreeChain'
import { uniqueByIdAndNestingDepth } from './uniqueByIdAndNestingDepth'

export function parseRoutes(routes: Route[], url: string) {
  const allMatched: Route[] = []
  routes
    .filter((route) => route.regexpPath.test(url))
    .forEach((route) =>
      allMatched.push(...getRoutesTreeChain(routes, route.id))
    )
  const unique = uniqueByIdAndNestingDepth(allMatched)
  if (!unique.length) {
    console.error('[Easyroute] No routes matched')
  }
  return unique
}
