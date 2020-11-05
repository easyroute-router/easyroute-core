export default class SilentModeService {
  private history: RouteInfo[] = []
  private currentHistoryPosition = 0

  constructor(firstRoute: RouteInfo) {
    this.appendHistory(firstRoute)
  }

  public appendHistory(data: RouteInfo | RouteInfo[]) {
    if (Array.isArray(data)) {
      this.history.push(...data)
      this.currentHistoryPosition += data.length
    } else {
      this.history.push(data)
      this.currentHistoryPosition++
    }
  }

  public back() {
    return this.go(-1)
  }

  public go(howFar: number): string {
    const goResult = this.currentHistoryPosition + howFar
    const previousObject = this.history[goResult]
    if (previousObject) {
      this.currentHistoryPosition = goResult
      return previousObject?.fullPath ?? ''
    }
    return this.history[0].fullPath ?? ''
  }
}
