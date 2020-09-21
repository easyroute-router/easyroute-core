import { Route } from '../types'
import { checkAsyncAndDownload } from './checkAsyncAndDownload'

export async function downloadDynamicComponents(matchedRoutes: Route[]) {
  const nonDynamic = matchedRoutes.map(async (route) => {
    if (route.component) {
      route.component = await checkAsyncAndDownload(route.component)
    }
    if (route.components) {
      for await (const component of Object.entries(route.components)) {
        const [key, value] = component
        route.components[key] = await checkAsyncAndDownload(value)
      }
    }
    return route
  })
  return await Promise.all(nonDynamic)
}
