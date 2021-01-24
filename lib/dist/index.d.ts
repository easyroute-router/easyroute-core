import Observable from './utils/observable/Observable';
export default class Router {
    private settings;
    private readonly routes;
    private ignoreEvents;
    private silentControl;
    private currentUrl;
    beforeEach: RouterHook | null;
    afterEach: RouterHook | null;
    currentMatched: Observable<RouteMatchData[]>;
    currentRouteData: Observable<RouteInfoData>;
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
    get currentRoute(): RouteInfoData;
}
