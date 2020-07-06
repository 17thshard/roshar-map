import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { TextureLoader } from 'three'
import cracks from '@/assets/shattering.jpg'
import { clamp01 } from '@/utils'

export default class ShatteringPass extends ShaderPass {
  constructor () {
    const shader = {
      uniforms: {
        Texture: { value: null },
        Cracks: { value: null },
        Progress: { value: 0.0 }
      },
      // language=GLSL
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        }
      `,
      // language=GLSL
      fragmentShader: `
        uniform sampler2D Texture;
        uniform sampler2D Cracks;
        uniform float Progress;

        varying vec2 vUv;

        void main() {
          float crack = 1. - texture2D(Cracks, vUv).r;
          vec2 centered = 2. * vUv - vec2(1., 1.);
          float t = crack * smoothstep(length(centered), .0, 1. - Progress);
  
          gl_FragColor = mix(texture2D(Texture, vUv), vec4(.0, .0, .0, 1.), t);
        }
      `
    }

    super(shader, 'Texture')

    this.enabled = false
    this.entering = true
    this.t = 0

    new TextureLoader().load(cracks, (texture) => {
      this.uniforms.Cracks.value = texture
    })
  }

  enter () {
    this.entering = true
    this.enabled = true
  }

  leave () {
    this.entering = false
    this.enabled = true
  }

  render (renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    if (this.t <= 1) {
      this.t = clamp01(this.t + (this.entering ? 0.01 : -0.01))
    }

    if (!this.entering && this.t <= 0) {
      this.enabled = false
      this.t = 0
    }

    this.uniforms.Progress.value = this.t

    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive)
  }
}
