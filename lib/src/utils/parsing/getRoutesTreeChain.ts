export function getRoutesTreeChain(allRoutes: Route[], currentRoute: Route) {
  if (!currentRoute) return []
  const tree: Route[] = [currentRoute]
  let currentSeekingId: string | null = currentRoute.parentId
  do {
    const seed = allRoutes.find(
      (seedRoute) => seedRoute.id === currentSeekingId
    )
    seed && tree.push(seed)
    currentSeekingId = seed?.parentId ?? null
  } while (currentSeekingId)

  return tree
}
