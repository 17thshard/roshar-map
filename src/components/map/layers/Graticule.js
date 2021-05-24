import { Group } from 'three'
import { clamp01 } from '@/utils'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { Line2 } from 'three/examples/jsm/lines/Line2'
import { project } from '@/projection'

const MIN_LAT = -40
const MAX_LAT = 22
const MIN_LNG = -55
const MAX_LNG = 55

function buildLines (largeMaterial, smallMaterial) {
  const lines = []

  for (let latD = MIN_LAT; latD < MAX_LAT; latD++) {
    const points = []

    for (let lngD = MIN_LNG; lngD < MAX_LNG; lngD++) {
      const lat = Math.PI * 0.01 * latD
      const lng = Math.PI * 0.01 * lngD
      const projected = project({ lat, lng })
      points.push(projected.x, projected.y, 0.001)
    }

    const geometry = new LineGeometry()
    geometry.setPositions(points)

    const line = new Line2(geometry, latD % 10 === 0 ? largeMaterial : smallMaterial)
    line.computeLineDistances()
    line.scale.set(1, 1, 1)

    lines.push(line)
  }

  for (let lngD = MIN_LNG; lngD < MAX_LNG; lngD++) {
    const points = []

    for (let latD = MIN_LAT; latD < MAX_LAT; latD++) {
      const lat = Math.PI * 0.01 * latD
      const lng = Math.PI * 0.01 * lngD
      const projected = project({ lat, lng })
      points.push(projected.x, projected.y, 0)
    }

    const geometry = new LineGeometry()
    geometry.setPositions(points)

    const line = new Line2(geometry, lngD % 10 === 0 ? largeMaterial : smallMaterial)
    line.computeLineDistances()
    line.scale.set(1, 1, 1)

    lines.push(line)
  }

  return lines
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

  init (textures) {
    this.largeMaterial = new LineMaterial({
      color: 0x000000,
      linewidth: 0.002,
      vertexColors: false,
      dashed: false,
      alphaToCoverage: false,
      depthTest: false,
      transparent: true,
      opacity: 0.5
    })
    this.smallMaterial = new LineMaterial({
      color: 0x000000,
      linewidth: 0.001,
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
