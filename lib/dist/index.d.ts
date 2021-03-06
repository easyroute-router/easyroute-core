import Observable from './utils/observable/Observable';
import { RouteInfoData, RouteMatchData, BeforeRouterHook, AfterRouterHook, RouterSettings } from './types';
export default class Router {
    private settings;
    private readonly routes;
    private ignoreEvents;
    private silentControl;
    private currentUrl;
    private beforeEachHooks;
    private afterEachHooks;
    transitionOutHooks: BeforeRouterHook[];
    currentMatched: Observable<RouteMatchData[]>;
    currentRouteData: Observable<RouteInfoData>;
    currentRouteFromData: Observable<RouteInfoData | null>;
    constructor(settings: RouterSettings);
    private setParser;
    private getTo;
    private getFrom;
    private changeUrl;
    parseRoute(url: string, doPushState?: boolean): Promise<void>;
    private executeHook;
    push(url: string): Promise<void>;
    go(howFar: number): void;
    back(): void;
    beforeEach(hook: BeforeRouterHook): void;
    afterEach(hook: AfterRouterHook): void;
    transitionOut(hook: BeforeRouterHook): void;
    runHooksArray(hooks: BeforeRouterHook[] | AfterRouterHook[], to: RouteInfoData, from: RouteInfoData | null, type: 'before' | 'after' | 'transition'): Promise<boolean>;
    get mode(): import("./types").RouterMode;
    get base(): string;
    get currentRoute(): RouteInfoData;
}
