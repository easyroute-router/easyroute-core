import { deleteLastSlash } from './deleteLastSlash';
import { deleteFirstSlash } from './deleteFirstSlash';

export function constructUrl(url: string, base: string) {
  if (!base || url.includes(base)) return url;
  return `/${deleteLastSlash(base)}/${deleteFirstSlash(url)}`;
}
