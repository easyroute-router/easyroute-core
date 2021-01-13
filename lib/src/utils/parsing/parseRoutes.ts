import { getRoutesTreeChain } from './getRoutesTreeChain';
import { uniqueByIdAndNestingDepth } from './uniqueByIdAndNestingDepth';

export function parseRoutes(routes: RouteMatchData[], url: string) {
  const allMatched: RouteMatchData[] = [];
  routes.forEach(
    (route) =>
      route.regexpPath.test(url) &&
      allMatched.push(...getRoutesTreeChain(routes, route))
  );
  const unique = uniqueByIdAndNestingDepth(allMatched);
  // if (!unique.length) {
  //   console.error('[Easyroute] No routes matched')
  // }
  return unique;
}
