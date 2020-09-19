import { Route, RouteObject } from '../types';
export default class UrlParser {
    private static getQueryParams;
    private static getPathParams;
    static createRouteObject(matchedRoutes: Route[], url: string): RouteObject;
}
