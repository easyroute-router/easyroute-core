import { parseQuery } from '../utils/parsing/parseQuery';

export default class UrlParser {
  private static getQueryParams(queryString: string) {
    return parseQuery(queryString);
  }

  private static getPathParams(
    matchedRoute: RouteMatchData,
    url: string
  ): { [key: string]: string } {
    let pathValues: string[] = matchedRoute.regexpPath.exec(url) as string[];
    if (!pathValues) return {};
    pathValues = pathValues.slice(1, pathValues.length);
    const urlParams: { [key: string]: string } = {};
    for (let pathPart = 0; pathPart < pathValues.length; pathPart++) {
      const value = pathValues[pathPart];
      const key = matchedRoute.pathKeys[pathPart];
      urlParams[String(key)] = value;
    }
    return urlParams;
  }

  public static createRouteObject(
    matchedRoutes: RouteMatchData[],
    url: string
  ): RouteInfoData {
    matchedRoutes = matchedRoutes.filter(Boolean);
    const depths: number[] = matchedRoutes.map((route) => route.nestingDepth);
    const maxDepth = Math.max(...depths);
    const currentMatched = matchedRoutes.find(
      (route) => route.nestingDepth === maxDepth
    );
    const [pathString, queryString]: string[] = url.split('?');
    if (currentMatched) {
      const pathParams = UrlParser.getPathParams(currentMatched, pathString);
      const queryParams = UrlParser.getQueryParams(queryString);
      return {
        params: pathParams,
        query: queryParams,
        name: currentMatched.name,
        fullPath: url,
        meta: currentMatched.meta ?? {}
      };
    }
    return {
      params: {},
      query: {},
      fullPath: ''
    };
  }
}
