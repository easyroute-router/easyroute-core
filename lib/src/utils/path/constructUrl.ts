export function constructUrl(url: string, base: string) {
  if (!base || url.includes(base)) return url
  const strippedBase =
    base.charAt(base.length - 1) === '/' ? base.slice(0, -1) : base
  const strippedUrl = url.charAt(0) === '/' ? url.slice(1, url.length) : url
  return `/${strippedBase}/${strippedUrl}`
}
