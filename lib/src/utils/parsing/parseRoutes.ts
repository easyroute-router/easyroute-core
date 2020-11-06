import { getRoutesTreeChain } from './getRoutesTreeChain'
import { uniqueByIdAndNestingDepth } from './uniqueByIdAndNestingDepth'

export function parseRoutes(routes: Route[], url: string) {
  const allMatched: Route[] = []
  routes.forEach(
    (route) =>
      route.regexpPath.test(url) &&
      allMatched.push(...getRoutesTreeChain(routes, route))
  )
  const unique = uniqueByIdAndNestingDepth(allMatched)
  // if (!unique.length) {
  //   console.error('[Easyroute] No routes matched')
  // }
  return unique
}
