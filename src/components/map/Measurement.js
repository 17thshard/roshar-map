import { Group, Vector3 } from 'three'
import MultiLine from '@/components/map/layers/MultiLine'
import Highlight from '@/components/map/layers/Highlight'
import { project, unproject, distance } from '@/projection'

function midpoint (geo1, geo2) {
  const dLng = geo2.lng - geo1.lng

  const p1 = new Vector3(Math.cos(geo1.lat), 0, Math.sin(geo1.lat))
  const p2 = new Vector3(Math.cos(geo2.lat) * Math.cos(dLng), Math.cos(geo2.lat) * Math.sin(dLng), Math.sin(geo2.lat))

  const sum = p1.add(p2)

  return { lat: Math.atan2(sum.z, Math.sqrt(sum.x * sum.x + sum.y * sum.y)), lng: geo1.lng + Math.atan2(sum.y, sum.x) }
}

function constructGeodesic (geo1, geo2) {
  function recur (start, end, iterations) {
    const points = [start, end]
    const mid = midpoint(start, end)

    if (iterations > 0) {
      points.splice(0, 1, ...recur(start, mid, iterations - 1))
      points.splice(points.length - 2, 2, ...recur(mid, end, iterations - 1))
    } else {
      points.splice(1, 0, mid)
    }

    return points
  }

  return recur(geo1, geo2, 8)
}

export default class Measurement extends Group {
  constructor () {
    super()
    this.startHighlight = null
    this.endHighlight = null
  }

  reset () {
    this.start = null
    this.end = null

    if (this.geodesic !== null) {
      this.remove(this.geodesic)
      this.geodesic = null
    }
    if (this.startHighlight !== null) {
      this.remove(this.startHighlight)
      this.startHighlight = null
    }
    if (this.endHighlight !== null) {
      this.remove(this.endHighlight)
      this.endHighlight = null
    }
  }

  click (position) {
    const geo = unproject(position)

    if (this.start === null) {
      this.start = geo
      this.startHighlight = new Highlight(position.x, position.y, 0.2, true, new Vector3(23 / 255, 98 / 255, 15 / 255))
      this.startHighlight.opacity = 1
      this.add(this.startHighlight)
    } else if (this.end === null) {
      this.end = geo
      this.endHighlight = new Highlight(position.x, position.y, 0.2, true, new Vector3(23 / 255, 98 / 255, 15 / 255))
      this.endHighlight.opacity = 1
      this.add(this.endHighlight)
    } else {
      this.start = geo
      this.startHighlight.position.set(position.x, position.y, 1)
      this.end = null
      this.remove(this.endHighlight)
      this.endHighlight = null
    }

    this.updateGeodesic()

    return {
      start: this.start,
      end: this.end,
      distance: this.distance
    }
  }

  updateGeodesic () {
    if (this.start !== null && this.end !== null) {
      const points = constructGeodesic(this.start, this.end).map(project)
      this.geodesic = new MultiLine(points)
      this.distance = distance(this.start, this.end)
      this.add(this.geodesic)
    } else if (this.geodesic !== null) {
      this.remove(this.geodesic)
      this.geodesic = null
      this.distance = null
    }
  }

  update (camera, timestamp, delta) {
    this.children.forEach(c => c.update(camera, timestamp, delta))
  }
}
