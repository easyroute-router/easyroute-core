import { Route } from '../Router/types'
import { getRoutesTreeChain } from '../Utils/BuildRoutesTree'
import uniqBy from 'lodash/uniqBy'

export default class HashBasedRouting<T> {
  constructor(private routes: Route<T>[]) {}

  public parse(url: string): Route<T>[] {
    const matchedRoutes: Route<T>[] = this.routes.reduce(
      (total: Route<T>[], current: Route<T>) => {
        if (url.match(current.regexpPath as RegExp)) total.push(current)
        return total
      },
      []
    )
    let allMatched: Route<T>[] = []
    matchedRoutes.forEach((route) => {
      allMatched = [
        ...allMatched,
        ...getRoutesTreeChain(this.routes, route.id as string)
      ]
    })
    const unique = uniqBy(allMatched, 'id')
    if (!unique) {
      throw new Error('[Easyroute] No routes matched')
    }
    return unique
  }
}
