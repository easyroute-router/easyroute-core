import { stripBase } from '../path/stripBase'

export function setHashMode() {
  this.parseRoute(stripBase(window.location.hash, this.base) || '/')
  window.addEventListener('hashchange', () => {
    if (this.ignoreEvents) {
      this.ignoreEvents = false
      return
    }
    this.parseRoute(stripBase(window.location.hash, this.base))
  })
}
