import { AdditiveBlending, Group, Mesh, PlaneBufferGeometry, ShaderMaterial } from 'three'
import factionsFragmentShader from '@/components/map/factionsFragmentShader'
import { clamp01 } from '@/utils.js'

export default class Factions extends Group {
  constructor (texture) {
    super()
    this.position.set(0, 0, 1)
    this.frustumCulled = false

    this.enabled = false
    this.entering = true
    this.t = 0

    this.init(texture)
  }

  init (texture) {
    const geo = new PlaneBufferGeometry(2, 2, 1, 1)
    const mat = new ShaderMaterial({
      // language=GLSL
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 1.0), 1.0);
        }
      `,
      fragmentShader: factionsFragmentShader,
      uniforms: {
        Texture: { value: texture },
        Time: { value: 0 },
        Progress: { value: 0 }
      },
      depthTest: false,
      premultipliedAlpha: true,
      transparent: true,
      blending: AdditiveBlending
    })

    this.plane = new Mesh(geo, mat)
    this.plane.frustumCulled = false

    this.add(this.plane)
  }

  enter () {
    this.entering = true
    this.enabled = true
  }

  leave () {
    this.entering = false
    this.enabled = true
  }

  update (camera, timestamp) {
    if (!this.enabled) {
      return
    }

    if (this.t <= 1) {
      this.t = clamp01(this.t + (this.entering ? 0.05 : -0.05))
    }

    if (!this.entering && this.t <= 0) {
      this.enabled = false
      this.t = 0
    }

    this.plane.material.uniforms.Progress.value = this.t
    this.plane.material.uniforms.Time.value = timestamp / 1000
  }
}
