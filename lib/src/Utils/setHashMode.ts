import PathService from '../Services/PathService'

export function setHashMode() {
  this.parseRoute(PathService.stripBase(window.location.hash, this.base) || '/')
  window.addEventListener('hashchange', () => {
    if (this.ignoreEvents) {
      this.ignoreEvents = false
      return
    }
    this.parseRoute(PathService.stripBase(window.location.hash, this.base))
  })
}
