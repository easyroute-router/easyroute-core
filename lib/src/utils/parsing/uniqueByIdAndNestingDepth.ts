export function uniqueByIdAndNestingDepth(routesArray: Route[]) {
  const usedIds: string[] = []
  const usedDepths: number[] = []

  return routesArray.filter((route) => {
    if (usedIds.includes(route.id) || usedDepths.includes(route.nestingDepth))
      return false
    usedIds.push(route.id as string)
    usedDepths.push(route.nestingDepth as number)
    return true
  })
}
