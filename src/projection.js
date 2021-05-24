// Implementation of azimuthal equidistant projection
// Formulas taken from https://mathworld.wolfram.com/AzimuthalEquidistantProjection.html

// Projection is centered on 16 Rosharan degrees South
const CENTER_LAT = -Math.PI * 0.16
const CENTER_LNG = 0
const CENTER_X = 5
const CENTER_Y = 0
// "Radius" of Roshar in our rendered system (derived from the graticule on the OB Roshar map)
const RENDERED_RADIUS = 2100 / (2 * Math.PI)
const INV_RENDERED_RADIUS = 1 / RENDERED_RADIUS
// Real radius of Roshar in km (derived from https://wob.coppermind.net/events/332-jordancon-2018/#e10231)
const realRadius = 5663.146

const LAT0_SIN = Math.sin(CENTER_LAT)
const LAT0_COS = Math.cos(CENTER_LAT)

export function project (geo) {
  const lngSin = Math.sin(geo.lng - CENTER_LNG)
  const lngCos = Math.cos(geo.lng - CENTER_LNG)

  const latSin = Math.sin(geo.lat)
  const latCos = Math.cos(geo.lat)

  const rho = Math.acos(LAT0_SIN * latSin + LAT0_COS * latCos * lngCos)
  const kPrime = rho !== 0 ? rho * RENDERED_RADIUS / Math.sin(rho) : 0

  return { x: CENTER_X + kPrime * latCos * lngSin, y: CENTER_Y + kPrime * (LAT0_COS * latSin - LAT0_SIN * latCos * lngCos) }
}

export function unproject (position) {
  const x = (position.x - CENTER_X) * INV_RENDERED_RADIUS
  const y = (position.y - CENTER_Y) * INV_RENDERED_RADIUS

  const rho = Math.sqrt(x * x + y * y)

  const rhoCos = Math.cos(rho)
  const rhoSin = Math.sin(rho)

  const lng = CENTER_LNG + Math.atan2(x * rhoSin, rho * LAT0_COS * rhoCos - y * LAT0_SIN * rhoSin)
  const lat = Math.asin(rhoCos * LAT0_SIN + (y * rhoSin * LAT0_COS) / rho)

  return { lng, lat }
}

// General shortest distance on a sphere
export function distance (pos1, pos2) {
  return realRadius * Math.acos(Math.sin(pos1.lat) * Math.sin(pos2.lat) + Math.cos(pos1.lat) * Math.cos(pos2.lat) * Math.cos(Math.abs(pos1.lng - pos2.lng)))
}
