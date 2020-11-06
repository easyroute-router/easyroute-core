import Observable from './utils/observable/Observable'
import UrlParser from './Services/UrlParser'
import SilentModeService from './Services/SilentModeService'
import { setHistoryMode } from './utils/configuration/setHistoryMode'
import { setHashMode } from './utils/configuration/setHashMode'
import { downloadDynamicComponents } from './utils/code-splitting/downloadDynamicComponents'
import { isBrowser } from '../utils/index'
import { parseRoutes } from './utils/parsing/parseRoutes'
import { getPathInformation } from './utils/path/getPathInformation'
import { constructUrl } from './utils/path/constructUrl'
import { deleteLastSlash } from './utils/path/deleteLastSlash'
import { deleteEdgeSlashes } from './utils/path/deleteEdgeSlashes'

const SSR = !isBrowser()

export default class Router {
  private readonly routes: Route[] = []
  private ignoreEvents = false
  private silentControl: SilentModeService | null = null

  public beforeEach: RouterHook | null = null
  public afterEach: RouterHook | null = null
  public currentMatched = new Observable<Route[]>([])
  public currentRouteData = new Observable<RouteInfo>({
    params: {},
    query: {},
    name: ''
  })

  constructor(private settings: RouterSettings) {
    this.routes = getPathInformation(settings.routes)
    !SSR &&
      setTimeout(() => {
        this.setParser()
      }, 0)
    if (SSR && this.mode !== 'history')
      throw new Error('[Easyroute] SSR only works with "history" router mode')
  }

  private setParser() {
    switch (this.mode) {
      case 'silent':
        this.parseRoute(`${window.location.pathname}${window.location.search}`)
        break
      case 'history':
        setHistoryMode.apply(this)
        break
      case 'hash':
      default:
        setHashMode.apply(this)
        break
    }
  }

  private getTo(matched: Route[]): Route {
    const maxDepth = Math.max(
      ...matched.map((route) => route.nestingDepth as number)
    )
    return matched.find((route) => route.nestingDepth === maxDepth) as Route
  }

  private getFrom(): Route | null {
    if (!this.currentMatched.getValue) return null
    const current: Route[] = this.currentMatched.getValue
    const maxDepth = Math.max(
      ...current.map((route) => route.nestingDepth as number)
    )
    return current.find((route) => route.nestingDepth === maxDepth) ?? null
  }

  private changeUrl(url: string, doPushState = true): void {
    if (this.mode === 'hash') {
      window.location.hash = url
    }
    if (this.mode === 'history' && doPushState && !SSR) {
      window.history.pushState(
        {
          url
        },
        'Test',
        url
      )
    }
  }

  private async runAllIndividualHooks(
    matched: Route[],
    to: RouteInfo,
    from: RouteInfo | null
  ) {
    for await (const component of matched) {
      const allow = await this.executeBeforeHook(
        to,
        from,
        component.beforeEnter as RouterHook
      )
      if (!allow) {
        return false
      }
    }
    return true
  }

  public async parseRoute(url: string, doPushState = true) {
    if (this.mode === 'hash' && url.includes('#')) url = url.replace('#', '')
    if (this.mode === 'history' && url.includes('#')) url = url.replace('#', '')
    const matched = parseRoutes(this.routes, url.split('?')[0])
    if (!matched) return
    const to = this.getTo(matched)
    const from = this.getFrom()
    const toRouteInfo = UrlParser.createRouteObject([to], url)
    const fromRouteInfo = from ? UrlParser.createRouteObject([from], url) : null
    if (this.mode === 'silent' && !this.silentControl) {
      this.silentControl = new SilentModeService(toRouteInfo)
    }
    if (this.silentControl && doPushState) {
      this.silentControl.appendHistory(toRouteInfo)
    }
    const allowNextGlobal = await this.executeBeforeHook(
      toRouteInfo,
      fromRouteInfo,
      this.beforeEach as RouterHook
    )
    const allowNextLocal = await this.runAllIndividualHooks(
      matched,
      toRouteInfo,
      fromRouteInfo
    )
    const allowNext = allowNextGlobal && allowNextLocal
    if (!allowNext) return
    this.changeUrl(constructUrl(url, this.base), doPushState)
    this.currentRouteData.setValue(toRouteInfo)
    this.currentMatched.setValue(await downloadDynamicComponents(matched))
    this.afterHook(toRouteInfo, fromRouteInfo)
  }

  private async executeBeforeHook(
    to: RouteInfo,
    from: RouteInfo | null,
    hook: RouterHook
  ) {
    return new Promise(async (resolve) => {
      const next = (command?: HookCommand) => {
        if (command !== null && command !== undefined) {
          if (command === false) resolve(false)
          if (typeof command === 'string') {
            this.parseRoute(command)
            resolve(false)
          }
        } else {
          resolve(true)
        }
      }
      if (!hook) resolve(true)
      else await hook(to, from, next)
    })
  }

  private afterHook(to: RouteInfo, from: RouteInfo | null) {
    this.afterEach && this.afterEach(to, from)
  }

  public async push(url: string) {
    this.ignoreEvents = true
    await this.parseRoute(url)
  }

  public go(howFar: number) {
    if (this.mode !== 'silent') {
      window.history.go(howFar)
    } else {
      this.parseRoute(this.silentControl!.go(howFar), false)
    }
  }

  public back() {
    this.go(-1)
  }

  get mode() {
    return this.settings.mode
  }

  get base() {
    if (!this.settings.base) return ''
    return deleteEdgeSlashes(this.settings.base) + '/'
  }

  get currentRoute() {
    return this.currentRouteData.getValue
  }
}
