import { Route } from '../types'
import { getRoutesTreeChain } from '../Utils/BuildRoutesTree'
import { uniqueByIdAndNestingDepth } from '../Utils/uniqueBy'

export default class ParserService {
  constructor(private routes: Route[]) {}

  public parse(url: string): Route[] {
    const matchedRoutes: Route[] = this.routes.reduce(
      (total: Route[], current: Route) => {
        if (url.match(current.regexpPath as RegExp)) total.push(current)
        return total
      },
      []
    )
    let allMatched: Route[] = []
    matchedRoutes.forEach((route) => {
      allMatched = [
        ...allMatched,
        ...getRoutesTreeChain(this.routes, route.id as string)
      ]
    })
    const unique = uniqueByIdAndNestingDepth(allMatched)
    if (!unique) {
      throw new Error('[Easyroute] No routes matched')
    }
    return unique
  }
}
