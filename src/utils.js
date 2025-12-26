/**
 * Compares two events based on their date and tieBreaker property.
 * @param {object} a - The first event.
 * @param {number[]} [a.date] - The date of the first event.
 * @param {number} [a.tieBreaker] - The tie breaker value of the first event.
 * @param {object} b - The second event.
 * @param {number[]} [b.date] - The date of the second event.
 * @param {number} [b.tieBreaker] - The tie breaker value of the second event.
 * @returns {number} - 1 if a > b, -1 if a < b, or difference in date components.
 */
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

/**
 * Calculates the smootherstep value for a given t.
 * @param {number} t - The input value.
 * @returns {number} - The smootherstep value.
 */
export function smootherstep (t) {
  if (t <= 0) {
    return 0
  }

  if (t >= 1) {
    return 1
  }

  return 6 * t ** 5 - 15 * t ** 4 + 10 * t ** 3
}

/**
 * Linearly interpolates between a and b by t.
 * @param {number} a - The start value.
 * @param {number} b - The end value.
 * @param {number} t - The interpolation factor.
 * @returns {number} - The interpolated value.
 */
export function lerp (a, b, t) {
  return a + (b - a) * t
}

/**
 * Clamps a value between 0 and 1.
 * @param {number} t - The value to clamp.
 * @returns {number} - The clamped value.
 */
export function clamp01 (t) {
  return Math.max(0, Math.min(t, 1))
}

/**
 * Calculates the inverse lerp value.
 * @param {number} a - The start value.
 * @param {number} b - The end value.
 * @param {number} value - The value to interpolate.
 * @returns {number} - The interpolation factor.
 */
export function inverseLerp (a, b, value) {
  return clamp01((value - a) / (b - a))
}

/**
 * Formats a date array into a string.
 * @param {number[]} date - The date array [year, month, week, day].
 * @returns {string} - The formatted date string.
 */
export function formatDate (date) {
  return date.filter(n => !Number.isNaN(n)).join('.')
}

/**
 * Calculates the timestamp in a year.
 * @param {number[]} dateComponents - The date components [month, week, day].
 * @returns {number} - The timestamp.
 */
export function getTimestampInYear ([month, week, day]) {
  return day + week * 5 + month * 50
}

/**
 * Parses a hex color string to a CSS variable value (r, g, b).
 * @param {string} hexColor - The hex color string (e.g., "#RRGGBB").
 * @returns {string} - The CSS variable value.
 */
export function parseColorToCssVar (hexColor) {
  const parseComponent = i => Number.parseInt(hexColor.substring(i * 2 + 1, i * 2 + 3), 16)

  return [parseComponent(0), parseComponent(1), parseComponent(2)].join(', ')
}

/**
 * Escapes characters in a path for CSS usage.
 * @param {string} path - The path to escape.
 * @returns {string} - The escaped path.
 */
export function escapeCssPath (path) {
  return path.replace('\'', '\\\'').replace('(', '\\(').replace(')', '\\)')
}

const entryImageUrls = import.meta.glob('/src/assets/entries/**/*.{png,jpg,jpeg,webp}', {
  eager: true,
  query: { w: '500;1000;original', as: 'srcset' },
  import: 'default'
})

/**
 * Gets the source set for an entry image.
 * @param {string} path - The image path.
 * @param {object} [gtag] - The Google Analytics object.
 * @returns {{sources: {url: string, size: string}[], css: string[]}} - The source set object.
 */
export function getEntryImageSrcSet (path, gtag) {
  try {
    const srcSet = entryImageUrls[`/src/assets/entries/${path}`]
    if (!srcSet) {
      throw new Error(`Unknown entry image path: ${path}`)
    }
    return parseSrcSet(srcSet)
  } catch (e) {
     
    console.error(`Could not retrieve entry image '${path}'`)
    if (gtag) {
      gtag.exception({
        description: `Could not retrieve entry image '${path}: ${e.message ?? e}'`,
        fatal: false
      })
    }
    throw e
  }
}

/**
 * Parses a source set string into an object.
 * @param {string} srcSet - The source set string.
 * @returns {{sources: {url: string, size: string}[], css: string[]}} - The source set object.
 */
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

/**
 * Creates a debounced function.
 * @param {Function} func - The function to debounce.
 * @param {number} [timeout=300] - The timeout in milliseconds.
 * @returns {Function} - The debounced function.
 */
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
