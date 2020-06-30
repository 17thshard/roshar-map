<template>
  <div class="map" />
</template>

<script>
import {
  Mesh,
  PerspectiveCamera,
  PlaneBufferGeometry,
  Scene,
  ShaderMaterial,
  TextureLoader,
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
    this.controls.addEventListener('click', ({ position }) => {
      this.controls.transitionTo(position)
    })

    const texture = new TextureLoader().load(mapTexture)

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

        varying highp vec2 vUv;

        uniform highp sampler2D Texture;

        void main() {
          gl_FragColor = texture2D(Texture, vUv);
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
  position: relative;
  flex: 1;
  min-height: 0;

  canvas {
    width: 100% !important;
    height: 100% !important;
    z-index: 0;
    position: relative;

    &:focus {
      outline: none;
    }
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
