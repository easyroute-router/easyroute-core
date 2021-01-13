import { deleteLastSlash } from './deleteLastSlash';
import { deleteFirstSlash } from './deleteFirstSlash';

export function constructUrl(url: string, base: string) {
  if (!base || url.includes(base)) return url;
  const strippedBase = deleteLastSlash(base);
  const strippedUrl = deleteFirstSlash(url);
  return `/${strippedBase}/${strippedUrl}`;
}
