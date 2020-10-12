import { Group, Mesh, PlaneBufferGeometry, ShaderMaterial, Vector2 } from 'three'
import { clamp01, inverseLerp } from '@/utils'
import oathgateTextFragmentShader from '@/components/map/layers/oathgateTextFragmentShader'
import OathgateLine from '@/components/map/layers/OathgateLine'
import Highlight from '@/components/map/layers/Highlight'

export default class Oathgates extends Group {
  constructor (textures) {
    super()

    this.position.set(0, 0, 1)
    this.frustumCulled = false

    this.enabled = false
    this.entering = true
    this.progress = 0

    this.dimming = true

    this.init(textures)
  }

  init (textures) {
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
      fragmentShader: oathgateTextFragmentShader,
      uniforms: {
        Texture: { value: textures.oathgates_text },
        PatternTexture: { value: textures.text_pattern },
        Opacity: { value: this.t }
      },
      extensions: {
        derivatives: true
      },
      transparent: true,
      depthTest: false
    })

    this.textPlane = new Mesh(geo, mat)
    this.textPlane.frustumCulled = false

    const oathgateLocations = [
      new Vector2(367.2 - 512, 256 - 115.3),
      new Vector2(449.2 - 512, 256 - 156.7),
      new Vector2(197 - 512, 256 - 286.8),
      new Vector2(300.8 - 512, 256 - 230.3),
      new Vector2(397.4 - 512, 256 - 245.4),
      new Vector2(414.3 - 512, 256 - 331.5),
      new Vector2(597.5 - 512, 256 - 419.6),
      new Vector2(609.8 - 512, 256 - 334.5),
      new Vector2(768 - 512, 256 - 364.2),
      new Vector2(738.7 - 512, 256 - 250.6)
    ]

    const urithiruPosition = new Vector2(486.1 - 512, 256 - 318.5)

    this.gates = new Group()

    this.gates.add(
      ...oathgateLocations.flatMap(l => [new OathgateLine(l, urithiruPosition), new Highlight(l.x, l.y, 0.3, true)]),
      new Highlight(urithiruPosition.x, urithiruPosition.y, 0.3, true)
    )

    this.add(this.gates, this.textPlane)
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

    if (this.progress <= 1) {
      this.progress = clamp01(this.progress + (this.entering ? 0.01 : -0.01))
    }

    if (!this.entering && this.progress <= 0) {
      this.enabled = false
      this.progress = 0
    }

    this.gates.children.forEach((child) => {
      if (child.name === 'line') {
        child.opacity = this.entering ? inverseLerp(0.3, 1, this.progress) : inverseLerp(0.7, 1, this.progress)
      } else {
        child.opacity = this.entering ? inverseLerp(0, 0.3, this.progress) : inverseLerp(0.3, 0.6, this.progress)
      }

      child.update(camera, timestamp)
    })

    this.textPlane.material.uniforms.Opacity.value = this.entering ? inverseLerp(0, 0.3, this.progress) : inverseLerp(0.3, 0.6, this.progress)
  }
}
