export function smootherstep (t) {
  if (t <= 0) {
    return 0
  }

  if (t >= 1) {
    return 1
  }

  return 6 * t ** 5 - 15 * t ** 4 + 10 * t ** 3
}

export function lerp (a, b, t) {
  return a + (b - a) * t
}

export function clamp01 (t) {
  return Math.max(0, Math.min(t, 1))
}

export function inverseLerp (a, b, value) {
  return clamp01((value - a) / (b - a))
}

export function formatDate (date) {
  return date.filter(n => !Number.isNaN(n)).join('.')
}

export function getTimestampInYear ([month, week, day]) {
  return day + week * 5 + month * 50
}

export function parseColorToCssVar (hexColor) {
  const parseComponent = i => Number.parseInt(hexColor.substring(i * 2 + 1, i * 2 + 3), 16)

  return [parseComponent(0), parseComponent(1), parseComponent(2)].join(', ')
}

export function escapeCssPath (path) {
  return path.replace('\'', '\\\'').replace('(', '\\(').replace(')', '\\)')
}

export function getEntryImageSrcSet (path) {
  return parseSrcSet(require(`@/assets/entries/${path}?srcset`))
}

export function parseSrcSet (srcSet) {
  const sources = srcSet.split(',').map((source) => {
    const [, url, size] = /^(.+)\s+(\d+x)$/.exec(source.trim())

    return { url, size }
  })

  const baseCss = `image-set(${sources.map(source => `url('${escapeCssPath(source.url)}') ${source.size}`).join(', ')})`

  return {
    sources,
    css: [`url('${escapeCssPath(sources[0].url)}')`, `-webkit-${baseCss}`, baseCss]
  }
}
