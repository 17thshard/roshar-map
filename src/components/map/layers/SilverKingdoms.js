import { Group, Mesh, PlaneBufferGeometry, ShaderMaterial } from 'three'
import silverKingdomsFragmentShader from '@/components/map/layers/silverKingdomsFragmentShader'
import silverKingdomsTextFragmentShader from '@/components/map/layers/silverKingdomsTextFragmentShader'
import { clamp01 } from '@/utils'

export default class SilverKingdoms extends Group {
  constructor (textures) {
    super()

    this.position.set(0, 0, 1)
    this.frustumCulled = false

    this.enabled = false
    this.entering = true
    this.t = 0

    this.dimming = true

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
      fragmentShader: silverKingdomsFragmentShader,
      uniforms: {
        Texture: { value: textures.oathgates_silver_kingdoms },
        Opacity: { value: this.t }
      },
      extensions: {
        derivatives: true
      },
      transparent: true,
      depthTest: false
    })
    const textMaterial = new ShaderMaterial({
      // language=GLSL
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 1.0), 1.0);
        }
      `,
      fragmentShader: silverKingdomsTextFragmentShader,
      uniforms: {
        Texture: { value: textures.oathgates_silver_kingdoms },
        PatternTexture: { value: textures.text_pattern },
        Opacity: { value: this.t }
      },
      extensions: {
        derivatives: true
      },
      transparent: true,
      depthTest: false
    })

    this.bordersPlane = new Mesh(geo, bordersMaterial)
    this.bordersPlane.frustumCulled = false

    this.textPlane = new Mesh(geo, textMaterial)
    this.textPlane.frustumCulled = false

    this.add(this.bordersPlane, this.textPlane)
  }

  enter () {
    this.entering = true
    this.enabled = true
  }

  leave () {
    this.entering = false
    this.enabled = true
  }

  update () {
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

    this.bordersPlane.material.uniforms.Opacity.value = this.t * 0.6
    this.textPlane.material.uniforms.Opacity.value = this.t
  }
}
