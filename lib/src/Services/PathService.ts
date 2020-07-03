import { pathToRegexp, Key } from 'path-to-regexp'
import { Route, RouteSettingsObject } from '../Router/types'
import generateId from '../Utils/IdGenerator'
import urljoin from 'url-join'

export default class PathService {
  private readonly pathToRegexp: any = pathToRegexp

  private parsePaths(routes: RouteSettingsObject[]): Route[] {
    const allRoutes: Route[] = []
    const recursive = (
      routesArray: RouteSettingsObject[],
      parentPath = '',
      nestingDepth = 0,
      parentId: string | null = null
    ) => {
      routesArray.forEach((_el) => {
        const el: any = { ..._el }
        if (parentPath.length) {
          parentPath = parentPath.replace(/\*/g, '')
          let elPath = el.path
          if (elPath != null && elPath[0] !== '/') elPath = `/${elPath}`
          el.path =
            (parentPath[parentPath.length - 1] !== '/' ? parentPath : '') +
            elPath
          el.nestingDepth = nestingDepth
        } else {
          el.nestingDepth = nestingDepth
        }
        el.parentId = parentId
        el.id = generateId()
        allRoutes.push(el as Route)
        if (el.children && el.children.length) {
          recursive(el.children, el.path, nestingDepth + 1, el.id)
        }
      })
    }
    recursive(routes)
    return allRoutes
  }

  public getPathInformation(routes: RouteSettingsObject[]): Route[] {
    const allRoutes: Route[] = this.parsePaths(routes)
    return allRoutes.map((route) => {
      const keysArray: Key[] = []
      route.regexpPath = this.pathToRegexp(route.path, keysArray)
      route.pathKeys = keysArray
      return route
    })
  }

  public static stripBase(url: string, base: string) {
    if (!base) return url
    return url.replace(`${base}/`, '')
  }

  public static constructUrl(url: string, base: string) {
    if (!base || url.includes(base)) return url
    else return `/${urljoin(base, url)}`
  }
}
