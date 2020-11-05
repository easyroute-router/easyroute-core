declare type RouteComponent = any

declare type NextCallback = (arg?: boolean | string) => void

declare type ParsedQueryObject = {
    [key: string]: string | string[] | null
}

declare module 'regexparam'

/**
 * RouteConfig: what we pass in routes[] array
 */

declare interface RouteConfigBasic {
    path: string
    name?: string
    beforeEnter?: BeforeHook
    children?: RouteConfig[]
}

declare interface RouteConfigSingleComponent extends RouteConfigBasic {
    component: RouteComponent
    components: never
}

declare interface RouteConfigMultiComponent extends RouteConfigBasic {
    components: { [key: string]: RouteComponent }
    component: never
}

declare type RouteConfig = RouteConfigSingleComponent | RouteConfigMultiComponent

/**
 * RouteInfo: what is in currentRoute
 */

declare type RouteInfo = {
    params: { [key: string]: string }
    query: ParsedQueryObject
    name?: string
    fullPath?: string
    meta?: any
}

/**
 * Route: what we get when parse RouteConfig
 */

declare interface RouteBasic {
    path: string
    regexpPath: RegExp
    pathKeys: string[]
    id: string
    parentId: string | null
    nestingDepth: number
    meta?: any
    beforeEnter?: BeforeHook
    children?: Route[]
    name?: string
}

declare interface RouteSingleComponent extends RouteBasic {
    component: RouteComponent
    components: never
}

declare interface RouteMultiComponent extends RouteBasic {
    component: never
    components: { [key: string]: RouteComponent }
}

declare type Route = RouteSingleComponent | RouteMultiComponent

declare type RouterMode = 'hash' | 'history' | 'silent'

declare type RouterSettings = {
    mode: RouterMode
    routes: RouteConfig[]
    base?: string
}

declare type RouterHook = (to: RouteInfo, from: RouteInfo | null, next?: NextCallback) => void | Promise<void>

declare type HookCommand = boolean | string

declare type ObservableListener<T> = (value: T) => void
