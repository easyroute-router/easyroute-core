import {
  Route,
  RouterSettings,
  HookCommand,
  Callback,
  RouteObject,
  RouterHook
} from './types'
import PathService from './Services/PathService'
import ParserService from './Services/ParserService'
import Observable from './Utils/Observable'
import UrlParser from './Services/UrlParser'
import SilentModeService from './Services/SilentModeService'
import { setHistoryMode } from './Utils/setHistoryMode'
import { setHashMode } from './Utils/setHashMode'

export default class Router {
  private pathService = new PathService()
  private readonly routes: Route[] = []
  private parser: ParserService
  private ignoreEvents = false
  private silentControl: SilentModeService | null = null

  public beforeEach: RouterHook | null = null
  public afterEach: Callback | null = null

  public currentMatched = new Observable<Route[]>([])
  public currentRouteData = new Observable<RouteObject>({
    params: {},
    query: {},
    name: ''
  })

  constructor(private settings: RouterSettings) {
    this.routes = this.pathService.getPathInformation(settings.routes)
    this.parser = new ParserService(this.routes)
    setTimeout(() => {
      this.setParser()
    }, 0)
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

  private getTo(matched: Route[], url: string): RouteObject {
    const maxDepth = Math.max(
      ...matched.map((route) => route.nestingDepth as number)
    )
    const currentRoute = matched.find(
      (route) => route.nestingDepth === maxDepth
    ) as Route
    if (!currentRoute)
      return {
        params: {},
        query: {}
      }
    return Object.freeze(UrlParser.createRouteObject([currentRoute], url))
  }

  private getFrom(): RouteObject {
    if (!this.currentMatched.getValue)
      return {
        params: {},
        query: {}
      }
    const current: Route[] = this.currentMatched.getValue
    const maxDepth = Math.max(
      ...current.map((route) => route.nestingDepth as number)
    )
    const currentRoute = current.find(
      (route) => route.nestingDepth === maxDepth
    ) as Route
    if (!currentRoute)
      return {
        params: {},
        query: {}
      }
    const url = this.currentRouteData.getValue.fullPath
    return Object.freeze(
      UrlParser.createRouteObject([currentRoute], url as string)
    )
  }

  private changeUrl(url: string, doPushState = true): void {
    if (this.mode === 'hash') {
      window.location.hash = url
    }
    if (this.mode === 'history' && doPushState) {
      window.history.pushState(
        {
          url
        },
        'Test',
        url
      )
    }
  }

  private async downloadDynamicComponents(matchedRoutes: Route[]) {
    const nonDynamic = matchedRoutes.map(async (route) => {
      const isAsync = /(\.then)/i.test(route.component.toString())
      if (!isAsync) return route
      else {
        try {
          const component = await route.component()
          route.component = component.default
          return route
        } catch (e) {
          console.warn(
            `[Easyroute] caught an error while trying to download async component: "${e.message}"`
          )
          return route
        }
      }
    })
    return await Promise.all(nonDynamic)
  }

  private async runAllIndividualHooks(
    matched: Route[],
    to: Route,
    from: Route
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
    const matched = this.parser.parse(url.split('?')[0])
    if (!matched) return
    const to = this.getTo(matched, url)
    const from = this.getFrom()
    if (this.mode === 'silent' && !this.silentControl) {
      this.silentControl = new SilentModeService(to)
    }
    if (this.silentControl && doPushState) {
      this.silentControl.appendHistory(to)
    }
    const allowNextGlobal = await this.executeBeforeHook(
      to,
      from,
      this.beforeEach as RouterHook
    )
    const allowNextLocal = await this.runAllIndividualHooks(matched, to, from)
    const allowNext = allowNextGlobal && allowNextLocal
    if (!allowNext) return
    this.changeUrl(PathService.constructUrl(url, this.base), doPushState)
    this.currentRouteData.setValue(to)
    this.currentMatched.setValue(await this.downloadDynamicComponents(matched))
    this.afterHook(to, from)
  }

  public async navigate(url: string) {
    this.ignoreEvents = true
    await this.parseRoute(url)
  }

  private async executeBeforeHook(to: Route, from: Route, hook: RouterHook) {
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

  private afterHook(to: Route, from: Route) {
    this.afterEach && this.afterEach(to, from)
  }

  public async push(data: string) {
    await this.navigate(data)
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
    return this.settings.base ?? ''
  }

  get currentRoute() {
    return this.currentRouteData.getValue
  }
}
