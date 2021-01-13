import { stripBase } from '../path/stripBase';
import { deleteLastSlash } from '../path/deleteLastSlash';

export function setHistoryMode() {
  this.parseRoute(
    stripBase(
      `${deleteLastSlash(window.location.pathname)}/${window.location.search}`,
      this.base
    ),
    true
  );
  window.addEventListener('popstate', (ev) => {
    ev.state
      ? this.parseRoute(stripBase(ev.state.url, this.base), false)
      : this.parseRoute('/', false);
  });
}
