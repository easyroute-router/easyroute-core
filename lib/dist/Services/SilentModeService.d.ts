export default class SilentModeService {
    private history;
    private currentHistoryPosition;
    constructor(firstRoute: RouteInfoData);
    appendHistory(data: RouteInfoData | RouteInfoData[]): void;
    back(): string;
    go(howFar: number): string;
}
