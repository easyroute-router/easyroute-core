import { Route } from '../Router/types'

export function uniqueByIdAndNestingDepth(routesArray: Route[]) {
  const uniqueIds = [...new Set(routesArray.map((route) => route.id))]
  const uniqueDepths = [
    ...new Set(routesArray.map((route) => route.nestingDepth))
  ]
  const uniqueById = uniqueIds.map(
    (id) => routesArray.find((route) => route.id === id) as Route
  )
  return uniqueDepths.map(
    (depth) => uniqueById.find((route) => route.nestingDepth === depth) as Route
  )
}
