export function compareEvents (a, b) {
  if (a.date === undefined) {
    return 1
  } else if (b.date === undefined) {
    return -1
  }

  let j = 0

  for (let i = 0; i < a.date.length; i++) {
    if (j === b.date.length - 1 && b.date[j] !== a.date[i]) {
      return a.date[i] - b.date[j]
    }

    if (a.date[i] !== b.date[j]) {
      return a.date[i] - b.date[j]
    }

    j += 1
  }

  if (j !== b.date.length) {
    return -1
  }

  if (a.tieBreaker !== undefined && b.tieBreaker !== undefined) {
    return a.tieBreaker - b.tieBreaker
  } else if (a.tieBreaker !== undefined) {
    return 1
  }

  return -1
}

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

export function getEntryImageSrcSet (path, gtag) {
  try {
    return parseSrcSet(require(`@/assets/entries/${path}?srcset`))
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Could not retrieve entry image '${path}'`)
    if (gtag) {
      this.$gtag.exception({
        description: `Could not retrieve entry image '${path}: ${e.message ?? e}'`,
        fatal: false
      })
    }
    throw e
  }
}

export function parseSrcSet (srcSet) {
  const sources = srcSet.split(',').map((source) => {
    const [, url, size] = /^(.+)\s+(\d+)w$/.exec(source.trim())

    return { url, size: `${Number.parseInt(size) / 500}x` }
  })

  const baseCss = `image-set(${sources.map(source => `url('${escapeCssPath(source.url)}') ${source.size}`).join(', ')})`

  return {
    sources,
    css: [`url('${escapeCssPath(sources[0].url)}')`, `-webkit-${baseCss}`, baseCss]
  }
}

export function debounce (func, timeout = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(
      () => {
        func.apply(this, args)
      },
      timeout
    )
  }
}
