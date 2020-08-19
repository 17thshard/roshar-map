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
