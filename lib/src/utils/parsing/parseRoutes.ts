export function parseRoutes(routes: RouteMatchData[], url: string) {
  const usedIds: string[] = [];
  const usedDepths: number[] = [];

  return routes.filter((route) => {
    if (
      usedIds.includes(route.id) ||
      usedDepths.includes(route.nestingDepth) ||
      !route.regexpPath.test(url)
    )
      return false;
    usedIds.push(route.id as string);
    usedDepths.push(route.nestingDepth as number);
    return true;
  });
}
