import PathService from '../Services/PathService'

export function setHistoryMode() {
  this.parseRoute(`${window.location.pathname}${window.location.search}`, false)
  window.addEventListener('popstate', (ev) => {
    ev.state
      ? this.parseRoute(PathService.stripBase(ev.state.url, this.base), false)
      : this.parseRoute('/', false)
  })
}
