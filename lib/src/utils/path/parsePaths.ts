import { generateId } from '../misc/generateId'
import { deleteLastSlash } from './deleteLastSlash'
import { deleteEdgeSlashes } from './deleteEdgeSlashes'

export function parsePaths(
  arr: any[],
  parentId: string | null = null,
  nestingDepth = 0,
  parentPath = '/'
): any[] {
  return arr.reduce((acc: Route[], val: RouteConfig) => {
    const componentPart: RouteComponent | RouteComponent[] =
      (val.component && { component: val.component }) ||
      (val.components && { components: val.components })
    const newRoute: Route = {
      ...val,
      ...componentPart,
      parentId,
      nestingDepth,
      path: deleteEdgeSlashes(parentPath) + '/' + deleteEdgeSlashes(val.path),
      id: generateId(),
      regexpPath: /.+/,
      pathKeys: []
    }
    if (Array.isArray(val.children)) {
      acc = acc.concat(
        parsePaths(
          newRoute.children as any[],
          newRoute.id,
          nestingDepth + 1,
          newRoute.path
        )
      )
    }
    return acc.concat(newRoute)
  }, [])
}
