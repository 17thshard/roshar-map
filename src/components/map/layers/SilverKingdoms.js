import { Group, Mesh, PlaneGeometry, ShaderMaterial } from 'three'
import silverKingdomsFragmentShader from '@/components/map/layers/silverKingdomsFragmentShader'
import silverKingdomsTextFragmentShader from '@/components/map/layers/silverKingdomsTextFragmentShader'
import { clamp01 } from '@/utils'

/**
 * Renders the Silver Kingdoms layer using shaders.
 */
export default class SilverKingdoms extends Group {
  /**
   * Creates the Silver Kingdoms layer.
   * @param {object} textures - The loaded textures.
   */
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

  /**
   * Initializes the meshes and materials.
   * @param {object} textures - The loaded textures.
   */
  init (textures) {
    const geo = new PlaneGeometry(2, 2, 1, 1)
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
        Texture: { value: textures.silver_kingdoms },
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
        Texture: { value: textures.silver_kingdoms_text },
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

  /**
   * Enters the scene.
   */
  enter () {
    this.entering = true
    this.enabled = true
    this.visible = true
  }

  /**
   * Leaves the scene.
   */
  leave () {
    this.entering = false
    this.enabled = true
  }

  /**
   * Updates the animation.
   * @param {object} camera - The camera.
   * @param {number} timestamp - The timestamp.
   * @param {number} delta - The time delta.
   */
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

    this.bordersPlane.material.uniforms.Opacity.value = this.t * 0.6
    this.textPlane.material.uniforms.Opacity.value = this.t
  }
}
