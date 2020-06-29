<template>
  <div class="map" />
</template>

<script>
import {
  LinearFilter,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from 'three'
import mapTexture from '@/assets/map.png'
import MapControls from '@/components/MapControls'

export default {
  name: 'Map',
  mounted () {
    this.camera = new PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.01,
      1e3
    )
    this.camera.position.set(30, -10, 40)
    this.renderer = new WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    this.controls = new MapControls(this.camera, this.renderer.domElement)
    this.controls.panSpeed = 0.75
    this.controls.target = new Vector3(0.0, 0.0, 0.0)
    this.controls.addEventListener('click', ({ position }) => {
      this.controls.transitionTo(position)
    })

    const texture = new TextureLoader().load(mapTexture)
    texture.magFilter = NearestFilter
    texture.magFilter = LinearFilter

    const geo = new PlaneBufferGeometry(2, 2, 1, 1)
    const mat = new ShaderMaterial({
      // language=GLSL
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 0), 1.0);
        }
      `,
      // language=GLSL
      fragmentShader: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        vec4 cubic(float v) {
          vec4 n = vec4(1.0, 2.0, 3.0, 4.0) - v;
          vec4 s = n * n * n;
          float x = s.x;
          float y = s.y - 4.0 * s.x;
          float z = s.z - 4.0 * s.y + 6.0 * s.x;
          float w = 6.0 - x - y - z;
          return vec4(x, y, z, w) * (1.0/6.0);
        }

        vec4 textureBicubic(sampler2D sampler, vec2 texCoords) {
          vec2 texSize = vec2(2048., 1024.);
          vec2 invTexSize = 1.0 / texSize;

          texCoords = texCoords * texSize - 0.5;


          vec2 fxy = fract(texCoords);
          texCoords -= fxy;

          vec4 xcubic = cubic(fxy.x);
          vec4 ycubic = cubic(fxy.y);

          vec4 c = texCoords.xxyy + vec2 (-0.5, +1.5).xyxy;

          vec4 s = vec4(xcubic.xz + xcubic.yw, ycubic.xz + ycubic.yw);
          vec4 offset = c + vec4 (xcubic.yw, ycubic.yw) / s;

          offset *= invTexSize.xxyy;

          vec4 sample0 = texture(sampler, offset.xz);
          vec4 sample1 = texture(sampler, offset.yz);
          vec4 sample2 = texture(sampler, offset.xw);
          vec4 sample3 = texture(sampler, offset.yw);

          float sx = s.x / (s.x + s.y);
          float sy = s.z / (s.z + s.w);

          return mix(mix(sample3, sample2, sx), mix(sample1, sample0, sx), sy);
        }

        vec4 sharpen(sampler2D tex, vec2 coords) {
          vec2 renderSize = vec2(2048., 1024.);
          float dx = 1.0 / renderSize.x;
          float dy = 1.0 / renderSize.y;
          vec4 sum = vec4(0.0);
          sum += -1. * textureBicubic(tex, coords + vec2(-1.0 * dx, 0.0 * dy));
          sum += -1. * textureBicubic(tex, coords + vec2(0.0 * dx, -1.0 * dy));
          sum += 5. * textureBicubic(tex, coords + vec2(0.0 * dx, 0.0 * dy));
          sum += -1. * textureBicubic(tex, coords + vec2(0.0 * dx, 1.0 * dy));
          sum += -1. * textureBicubic(tex, coords + vec2(1.0 * dx, 0.0 * dy));
          return sum;
        }

        varying highp vec2 vUv;

        uniform highp sampler2D Texture;

        void main() {
          gl_FragColor = sharpen(Texture, vUv);
        }
      `,
      uniforms: {
        Texture: { value: texture }
      }
    })
    this.plane = new Mesh(geo, mat)
    this.plane.frustumCulled = false

    this.scene = new Scene()
    this.scene.add(this.plane)

    this.$el.appendChild(this.renderer.domElement)

    this.latestAnimationFrame = requestAnimationFrame(this.animate)
  },
  destroyed () {
    this.renderer.dispose()
    cancelAnimationFrame(this.latestAnimationFrame)
  },
  methods: {
    animate (timestamp) {
      this.resizeCanvasToDisplaySize()
      this.latestAnimationFrame = requestAnimationFrame(this.animate)

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
    },
    resizeCanvasToDisplaySize () {
      const canvas = this.renderer.domElement
      // look up the size the canvas is being displayed
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      // adjust displayBuffer size to match
      if (canvas.width !== width || canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        this.renderer.setSize(width, height, false)
        this.camera.aspect = width / height
        this.camera.updateProjectionMatrix()
        // update any render target sizes here
      }
    }
  }
}
</script>

<style lang="scss">
.map {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  width: 100vw;
  height: 100vh;
  position: relative;

  canvas {
    width: 100% !important;
    height: 100% !important;
    z-index: 0;
    position: relative;
  }

  &:after {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.6);
    z-index: 10;
  }
}
</style>
