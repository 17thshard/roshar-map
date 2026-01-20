import { Group, Vector3 } from 'three'
import MultiLine from '@/components/map/layers/MultiLine'
import Highlight from '@/components/map/layers/Highlight'
import { project, unproject, distance } from '@/projection'
import { useMeasurementStore } from '@/stores/measurement'

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

  return recur(geo1, geo2, 5)
}

export default class Measurement extends Group {
  constructor () {
    super()
    this.highlights = []
    this.geodesic = null
    this.distance = null
    this.store = useMeasurementStore()

    this.syncFromStore()
  }

  syncFromStore() {
    this.reset(false)
    const points = this.store.points

    if (points.length === 0) return

    points.forEach(geo => {
      const position = project(geo)
      const highlight = new Highlight(position.x, position.y, 0.2, true, new Vector3(23 / 255, 98 / 255, 15 / 255))
      highlight.opacity = 1
      this.highlights.push(highlight)
      this.add(highlight)
    })

    this.updateGeodesic()
  }

  reset (clearStore = true) {
    if (clearStore) {
      this.store.clear()
    }

    if (this.geodesic !== null) {
      this.remove(this.geodesic)
      this.geodesic = null
    }
    this.highlights.forEach((highlight) => {
      this.remove(highlight)
    })
    this.highlights = []
    this.distance = null
  }

  click (position, ctrlKey) {
    const geo = unproject(position)

    if (ctrlKey) {
      this.store.addPoint(geo)
      const highlight = new Highlight(position.x, position.y, 0.2, true, new Vector3(23 / 255, 98 / 255, 15 / 255))
      highlight.opacity = 1
      this.highlights.push(highlight)
      this.add(highlight)
    } else if (this.store.points.length === 1) {
      this.store.addPoint(geo)
      const highlight = new Highlight(position.x, position.y, 0.2, true, new Vector3(23 / 255, 98 / 255, 15 / 255))
      highlight.opacity = 1
      this.highlights.push(highlight)
      this.add(highlight)
    } else {
      this.highlights.forEach((highlight) => {
        this.remove(highlight)
      })
      this.highlights = []
      this.store.setPoints([geo])
      const highlight = new Highlight(position.x, position.y, 0.2, true, new Vector3(23 / 255, 98 / 255, 15 / 255))
      highlight.opacity = 1
      this.highlights.push(highlight)
      this.add(highlight)
    }

    this.updateGeodesic()

    return {
      start: this.store.points[0] || null,
      end: this.store.points[this.store.points.length - 1] || null,
      distance: this.distance
    }
  }

  updateGeodesic () {
    if (this.geodesic !== null) {
      this.remove(this.geodesic)
      this.geodesic = null
      this.distance = null
    }

    if (this.store.points.length >= 2) {
      const allPoints = []
      let totalDistance = 0

      for (let i = 0; i < this.store.points.length - 1; i++) {
        const segmentPoints = constructGeodesic(this.store.points[i], this.store.points[i + 1]).map(project)
        if (i === 0) {
          allPoints.push(...segmentPoints)
        } else {
          allPoints.push(...segmentPoints.slice(1))
        }
        totalDistance += distance(this.store.points[i], this.store.points[i + 1])
      }

      this.geodesic = new MultiLine(allPoints)
      this.distance = totalDistance
      this.add(this.geodesic)
    }
  }

  update (camera, timestamp, delta) {
    this.children.forEach(c => c.update(camera, timestamp, delta))
  }
}
