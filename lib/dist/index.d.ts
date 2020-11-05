import Observable from './utils/observable/Observable';
export default class Router {
    private settings;
    private readonly routes;
    private ignoreEvents;
    private silentControl;
    beforeEach: RouterHook | null;
    afterEach: RouterHook | null;
    currentMatched: Observable<Route[]>;
    currentRouteData: Observable<RouteInfo>;
    constructor(settings: RouterSettings);
    private setParser;
    private getTo;
    private getFrom;
    private changeUrl;
    private runAllIndividualHooks;
    parseRoute(url: string, doPushState?: boolean): Promise<void>;
    private executeBeforeHook;
    private afterHook;
    push(url: string): Promise<void>;
    go(howFar: number): void;
    back(): void;
    get mode(): RouterMode;
    get base(): string;
    get currentRoute(): RouteInfo;
}
