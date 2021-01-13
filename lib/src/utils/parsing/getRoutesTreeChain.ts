export function getRoutesTreeChain(
  allRoutes: RouteMatchData[],
  currentRoute: RouteMatchData
) {
  if (!currentRoute) return [];
  const tree: RouteMatchData[] = [currentRoute];
  let currentSeekingId: string | null = currentRoute.parentId;
  do {
    const seed = allRoutes.find(
      (seedRoute) => seedRoute.id === currentSeekingId
    );
    seed && tree.push(seed);
    currentSeekingId = seed?.parentId ?? null;
  } while (currentSeekingId);

  return tree;
}
