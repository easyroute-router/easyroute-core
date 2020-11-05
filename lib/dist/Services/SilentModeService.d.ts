export default class SilentModeService {
    private history;
    private currentHistoryPosition;
    constructor(firstRoute: RouteInfo);
    appendHistory(data: RouteInfo | RouteInfo[]): void;
    back(): string;
    go(howFar: number): string;
}
