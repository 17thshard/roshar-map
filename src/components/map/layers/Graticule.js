import { Group, Mesh, PlaneBufferGeometry, ShaderMaterial } from 'three'
import graticuleFragmentShader from '@/components/map/layers/graticuleFragmentShader'
import { clamp01 } from '@/utils'

export default class Graticule extends Group {
  constructor (textures) {
    super()

    this.position.set(0, 0, 0.01)
    this.frustumCulled = false

    this.enabled = false
    this.entering = true
    this.t = 0

    this.dimming = false

    this.init(textures)
  }

  init (textures) {
    const geo = new PlaneBufferGeometry(2, 2, 1, 1)
    const bordersMaterial = new ShaderMaterial({
      // language=GLSL
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 1.0), 1.0);
        }
      `,
      fragmentShader: graticuleFragmentShader,
      uniforms: {
        Texture: { value: textures.graticule },
        TextTexture: { value: textures.graticule_text },
        Opacity: { value: this.t }
      },
      extensions: {
        derivatives: true
      },
      transparent: true,
      depthTest: false
    })

    this.plane = new Mesh(geo, bordersMaterial)
    this.plane.frustumCulled = false

    this.add(this.plane, this.plane)
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

    this.plane.material.uniforms.Opacity.value = this.t * 0.3
  }
}
