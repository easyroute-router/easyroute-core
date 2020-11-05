import { stripBase } from '../path/stripBase'

export function setHistoryMode() {
  this.parseRoute(
    stripBase(
      `${window.location.pathname}${window.location.search}`,
      this.base
    ),
    false
  )
  window.addEventListener('popstate', (ev) => {
    ev.state
      ? this.parseRoute(stripBase(ev.state.url, this.base), false)
      : this.parseRoute('/', false)
  })
}
