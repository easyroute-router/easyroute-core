import { generateId } from '../generateId'
import regexparam from 'regexparam'

function parsePaths(routes: RouteConfig[]): Route[] {
  const allRoutes: Route[] = []
  const recursive = (
    routesArray: RouteConfig[],
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
          (parentPath[parentPath.length - 1] !== '/' ? parentPath : '') + elPath
      }

      const componentPart: RouteComponent | RouteComponent[] =
        (el.component && { component: el.component }) ||
        (el.components && { components: el.components })
      const id = generateId()

      allRoutes.push({
        nestingDepth,
        parentId,
        id,
        regexpPath: /.+/,
        pathKeys: [],
        path: el.path,
        meta: {},
        beforeEnter: el.beforeEnter,
        name: el.name,
        ...componentPart
      })
      if (el.children && el.children.length) {
        recursive(el.children, el.path, nestingDepth + 1, id)
      }
    })
  }
  recursive(routes)
  return allRoutes
}

export function getPathInformation(routes: RouteConfig[]): Route[] {
  const allRoutes: Route[] = parsePaths(routes)
  return allRoutes.map((route) => {
    const { pattern, keys } = regexparam(route.path as string)
    route.regexpPath = pattern
    route.pathKeys = keys
    return route
  })
}
