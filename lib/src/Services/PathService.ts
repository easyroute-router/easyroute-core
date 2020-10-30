import { Route } from '../types'
import generateId from '../Utils/IdGenerator'
import regexparam from 'regexparam'

export default class PathService {
  private parsePaths(routes: Route[]): Route[] {
    const allRoutes: Route[] = []
    const recursive = (
      routesArray: Route[],
      parentPath = '',
      nestingDepth = 0,
      parentId: string | null = null
    ) => {
      routesArray.forEach((el) => {
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
        allRoutes.push(el)
        if (el.children && el.children.length) {
          recursive(el.children, el.path, nestingDepth + 1, el.id)
        }
      })
    }
    recursive(routes)
    return allRoutes
  }

  public getPathInformation(routes: Route[]): Route[] {
    const allRoutes: Route[] = this.parsePaths(routes)
    return allRoutes.map((route) => {
      const { pattern, keys } = regexparam(route.path as string)
      route.regexpPath = pattern
      route.pathKeys = keys
      return route
    })
  }

  public static stripBase(url: string, base: string) {
    if (!base) return url
    return url.replace(`${base}/`, '')
  }

  public static constructUrl(url: string, base: string) {
    if (!base || url.includes(base)) return url
    const strippedBase =
      base.charAt(base.length - 1) === '/' ? base.slice(0, -1) : base
    const strippedUrl = url.charAt(0) === '/' ? url.slice(1, url.length) : url
    return `/${strippedBase}/${strippedUrl}`
  }
}
