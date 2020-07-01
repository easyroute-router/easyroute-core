import { Route, RouterSettings, Callback, RouteObject } from './types';
import Observable from '../Utils/Observable';
export default class Router<T> {
    private settings;
    private pathService;
    private readonly routes;
    private parser;
    private ignoreEvents;
    private silentControl;
    beforeEach: Callback | null;
    afterEach: Callback | null;
    currentMatched: Observable<Route<T>[]>;
    currentRouteData: Observable<RouteObject>;
    constructor(settings: RouterSettings<T>);
    private setParser;
    private getTo;
    private getFrom;
    private changeUrl;
    parseRoute(url: string, doPushState?: boolean): Promise<void>;
    navigate(url: string): Promise<void>;
    private beforeHook;
    private afterHook;
    push(data: string): Promise<void>;
    go(howFar: number): void;
    back(): void;
    get mode(): string;
    get base(): string;
    get currentRoute(): RouteObject;
}
