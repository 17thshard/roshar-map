import { Group } from 'three'
import { clamp01 } from '@/utils'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry'
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2'
import { project } from '@/projection'

const MIN_LAT = -40
const MAX_LAT = 22
const MIN_LNG = -55
const MAX_LNG = 55

function buildLines (largeMaterial, smallMaterial) {
  const largePositions = []
  const smallPositions = []

  // Helper: Converts strip [x1,y1,z1, x2,y2,z2...] to segments [x1,y1,z1, x2,y2,z2, x2,y2,z2, x3...]
  const toSegments = (strip) => {
    const segments = []
    for (let i = 0; i < strip.length - 3; i += 3) {
      segments.push(
        strip[i], strip[i + 1], strip[i + 2],
        strip[i + 3], strip[i + 4], strip[i + 5]
      )
    }
    return segments
  }

  // latitude lines
  for (let latD = MIN_LAT; latD < MAX_LAT; latD++) {
    const points = []

    for (let lngD = MIN_LNG; lngD < MAX_LNG; lngD++) {
      const lat = Math.PI * 0.01 * latD
      const lng = Math.PI * 0.01 * lngD
      const projected = project({ lat, lng })
      points.push(projected.x, projected.y, 0.001)
    }

    const target = (latD % 10 === 0) ? largePositions : smallPositions
    target.push(...toSegments(points))
  }

  //  longitude lines
  for (let lngD = MIN_LNG; lngD < MAX_LNG; lngD++) {
    const points = []

    for (let latD = MIN_LAT; latD < MAX_LAT; latD++) {
      const lat = Math.PI * 0.01 * latD
      const lng = Math.PI * 0.01 * lngD
      const projected = project({ lat, lng })
      points.push(projected.x, projected.y, 0)
    }

    const target = (lngD % 10 === 0) ? largePositions : smallPositions
    target.push(...toSegments(points))
  }

  const meshes = []

  // large mesh
  if (largePositions.length > 0) {
    const geo = new LineSegmentsGeometry()
    geo.setPositions(largePositions)

    const mesh = new LineSegments2(geo, largeMaterial)
    mesh.scale.set(1, 1, 1)
    meshes.push(mesh)
  }

  // small mesh
  if (smallPositions.length > 0) {
    const geo = new LineSegmentsGeometry()
    geo.setPositions(smallPositions)

    const mesh = new LineSegments2(geo, smallMaterial)
    mesh.scale.set(1, 1, 1)
    meshes.push(mesh)
  }

  return meshes
}

export default class Graticule extends Group {
  constructor () {
    super()

    this.position.set(0, 0, 0.01)

    this.enabled = false
    this.entering = true
    this.t = 0

    this.dimming = false

    this.init()
  }

  init (_textures) {    
    this.largeMaterial = new LineMaterial({
      color: 0x000000,
      linewidth: 0.8,
      worldUnits: true,
      vertexColors: false,
      dashed: false,
      alphaToCoverage: false,
      depthTest: false,
      transparent: true,
      opacity: 0.5
    })
    this.smallMaterial = new LineMaterial({
      color: 0x000000,
      linewidth: 0.3,
      worldUnits: true,
      vertexColors: false,
      dashed: false,
      alphaToCoverage: false,
      depthTest: false,
      transparent: true,
      opacity: 0.5
    })

    this.add(...buildLines(this.largeMaterial, this.smallMaterial))
  }

  enter () {
    this.entering = true
    this.enabled = true
    this.visible = true
  }

  leave () {
    this.entering = false
    this.enabled = true
  }

  update (camera, timestamp, delta) {
    if (!this.enabled) {
      return
    }

    if (this.t <= 1) {
      this.t = clamp01(this.t + (this.entering ? 0.003 : -0.003) * delta)
    }

    if (!this.entering && this.t <= 0) {
      this.enabled = false
      this.visible = this.changeVisibility ? false : this.visible
      this.t = 0
    }

    this.largeMaterial.opacity = this.t * 0.3
    this.smallMaterial.opacity = this.t * 0.3
  }
}
