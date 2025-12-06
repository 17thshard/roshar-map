import { Group, Mesh, PlaneBufferGeometry, ShaderMaterial } from 'three'
import { clamp01 } from '@/utils.js'
import Highlight from '@/components/map/layers/Highlight'
import ascensionFragmentShader from '@/components/map/ascensionFragmentShader'

// Animation timing constants
const ANIMATION_SPEED = 0.00012
const PHASE_COGNITIVE_ENTER = 0.15
const PHASE_COGNITIVE_EXIT_START = 0.5
const PHASE_COGNITIVE_EXIT_END = 0.65

// Map dimensions for coordinate conversion
const MAP_WIDTH = 1024
const MAP_HEIGHT = 512
const MAP_CENTER_X = 512
const MAP_CENTER_Y = 256

export default class AscensionPass extends Group {
  constructor (bgTexture, transitionTexture, shatteredPlainsCoords) {
    super()

    this.position.set(0, 0, 2)
    this.frustumCulled = false

    this.enabled = false
    this.t = 0
    this.visible = false

    this.shatteredPlainsCoords = shatteredPlainsCoords
    this.shadesmarLayer = null
    this.highlight = null

    this.init(bgTexture, transitionTexture)
  }

  mapCoordsToUV (x, y) {
    return [x / MAP_WIDTH, 1.0 - (y / MAP_HEIGHT)]
  }

  mapCoordsTo3D (x, y) {
    return [x - MAP_CENTER_X, MAP_CENTER_Y - y]
  }

  init (bgTexture, transitionTexture) {
    const geo = new PlaneBufferGeometry(2, 2, 1, 1)

    const epicenterUV = this.shatteredPlainsCoords
      ? this.mapCoordsToUV(this.shatteredPlainsCoords.x, this.shatteredPlainsCoords.y)
      : [0.75, 0.29] // Fallback

    const mat = new ShaderMaterial({
      // language=GLSL
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 1.0), 1.0);
        }
      `,
      fragmentShader: ascensionFragmentShader,
      uniforms: {
        BgTexture: { value: bgTexture },
        TransitionTexture: { value: transitionTexture },
        Progress: { value: 0.0 },
        Time: { value: 0.0 },
        Epicenter: { value: epicenterUV },
        Transition: { value: 0.0 }
      },
      depthTest: false,
      premultipliedAlpha: true,
      transparent: true
    })

    this.plane = new Mesh(geo, mat)
    this.plane.frustumCulled = false
    this.add(this.plane)
  }

  enter (shadesmarLayer) {
    this.enabled = true
    this.visible = true
    this.t = 0
    this.shadesmarLayer = shadesmarLayer

    // Clean up any existing highlight before creating a new one
    this.removeHighlight()

    if (this.shatteredPlainsCoords) {
      const [x, y] = this.mapCoordsTo3D(this.shatteredPlainsCoords.x, this.shatteredPlainsCoords.y)
      this.highlight = new Highlight(x, y)
      this.highlight.position.z = 0.1
      this.add(this.highlight)
    }
  }

  leave () {
    this.enabled = false
    this.visible = false
    this.t = 0

    if (this.shadesmarLayer && this.shadesmarLayer.enabled) {
      this.shadesmarLayer.leave()
      this.shadesmarLayer = null
    }

    this.removeHighlight()
  }

  removeHighlight () {
    if (this.highlight) {
      if (this.highlight.parent) {
        this.remove(this.highlight)
      }
      this.highlight.leave()
      this.highlight = null
    }
  }

  update (camera, timestamp, delta) {
    if (!this.enabled) {
      return
    }

    if (this.t < 1) {
      this.t = clamp01(this.t + ANIMATION_SPEED * delta)
    }

    this.plane.material.uniforms.Progress.value = this.t
    this.plane.material.uniforms.Time.value = timestamp / 1000

    this.plane.material.uniforms.Transition.value = this.shadesmarLayer ? this.shadesmarLayer.progress : 0.0

    if (this.highlight) {
      this.highlight.update(camera, timestamp, delta)
    }

    if (!this.shadesmarLayer) {
      return
    }

    // Phase 1: Enter cognitive realm
    if (this.t >= 0.0 && this.t < PHASE_COGNITIVE_ENTER && !this.shadesmarLayer.enabled) {
      this.shadesmarLayer.enter()
    }

    // Phase 2: Exit cognitive realm
    if (this.t >= PHASE_COGNITIVE_EXIT_START && this.t < PHASE_COGNITIVE_EXIT_END && this.shadesmarLayer.entering) {
      this.shadesmarLayer.leave()
      this.removeHighlight()
    }
  }
}
