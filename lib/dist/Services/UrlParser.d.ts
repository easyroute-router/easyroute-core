import { Route, RouteObject } from '../Router/types';
export default class UrlParser {
    private static getQueryParams;
    private static getPathParams;
    static createRouteObject<T>(matchedRoutes: Route<T>[], url: string): RouteObject;
}
