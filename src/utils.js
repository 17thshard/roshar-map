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

export function compareDates ([yearA, monthA, weekA, dayA], [yearB, monthB, weekB, dayB]) {
  if (yearA === undefined && yearB === undefined) {
    return 0
  } else if (yearA === undefined) {
    return -1
  } else if (yearB === undefined) {
    return 1
  }

  if (yearA !== yearB) {
    return yearA - yearB
  }

  if (monthA === undefined && monthB === undefined) {
    return 0
  } else if (monthA === undefined) {
    return -1
  } else if (monthB === undefined) {
    return 1
  } else if (monthA !== monthB) {
    return monthA - monthB
  }

  if (weekA === undefined && weekB === undefined) {
    return 0
  } else if (weekA === undefined) {
    return -1
  } else if (weekB === undefined) {
    return 1
  } else if (weekA !== weekB) {
    return weekA - weekB
  }

  if (dayA === undefined && dayB === undefined) {
    return 0
  } else if (dayA === undefined) {
    return -1
  } else if (dayB === undefined) {
    return 1
  }

  return dayA - dayB
}

export function getTimestamp ([year, month, week, day]) {
  const yearValue = year >= 1 ? (year - 1) * 500 : year * 500
  return yearValue + (day ?? 1) - 1 + ((week ?? 1) - 1) * 5 + ((month ?? 1) - 1) * 50
}

export function getTimestampInYear ([month, week, day]) {
  return day + week * 5 + month * 50
}

export function parseColorToCssVar (hexColor) {
  const parseComponent = i => Number.parseInt(hexColor.substring(i * 2 + 1, i * 2 + 3), 16)

  return [parseComponent(0), parseComponent(1), parseComponent(2)].join(', ')
}
