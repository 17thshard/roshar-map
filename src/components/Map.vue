<template>
  <div class="map" />
</template>

<script>
import {
  AmbientLight,
  Group,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  PlaneBufferGeometry,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from 'three'
import isMobile from 'is-mobile'
import MapControls from '@/components/MapControls'
import Highlight from '@/components/Highlight'
import fragmentShader from '@/components/mapFragmentShader'
import textFragmentShader from '@/components/mapTextFragmentShader'

export default {
  name: 'Map',
  props: {
    highlightPosition: {
      type: Object,
      required: false,
      default: () => null
    },
    showShadesmar: {
      type: Boolean
    }
  },
  data () {
    return {
      transitionValue: 0,
      transitionDirection: 0
    }
  },
  watch: {
    highlightPosition: {
      handler (newPosition) {
        this.onHighlightPositionChanged(newPosition)
      }
    },
    showShadesmar: {
      handler (shouldShow) {
        this.onShadesmarChanged(shouldShow)
      }
    }
  },
  mounted () {
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.sortObjects = false

    this.loadTextures().then(this.setupScene).then(() => {
      this.$el.appendChild(this.renderer.domElement)

      this.update()

      this.$emit('ready')

      this.onHighlightPositionChanged(this.highlightPosition)
      this.onShadesmarChanged(this.showShadesmar)
    })
  },
  destroyed () {
    this.renderer.dispose()
    cancelAnimationFrame(this.latestAnimationFrame)
  },
  methods: {
    loadTextures () {
      const textures = {
        map_bg: {},
        map: { hqAvailable: true },
        shadesmar_map_bg: {},
        transition: {},
        text_pattern: {},
        map_text: { hqAvailable: true },
        shadesmar_map_text: { hqAvailable: true }
      }
      const result = {}

      const maxTextureSize = this.renderer.capabilities.maxTextureSize
      const useHq = maxTextureSize >= 8192 && !isMobile({ tablet: true, featureDetect: true })
      let webpSupported = false
      try {
        webpSupported = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0
      } catch (t) {
        webpSupported = false
      }

      const textureLoader = new TextureLoader()

      return new Promise((resolve) => {
        Object.keys(textures).forEach((name) => {
          const texture = textures[name]

          const prefix = texture.hqAvailable && useHq ? 'hq_' : ''
          const path = `${process.env.BASE_URL}textures/${prefix}${name}.${webpSupported ? 'webp' : 'png'}`

          textureLoader.load(path, (data) => {
            texture.loaded = true
            result[name] = data

            if (Object.keys(textures).every(t => textures[t].loaded === true)) {
              resolve(result)
            }
          })
        })
      })
    },
    setupScene (textures) {
      this.camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        1e3
      )
      this.camera.position.set(30, -10, 40)

      this.controls = new MapControls(this.camera, this.renderer.domElement)

      this.highlights = new Group()

      const geo = new PlaneBufferGeometry(2, 2, 1, 1)
      const mapMaterial = new ShaderMaterial({
        // language=GLSL
        vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 0), 1.0);
        }
      `,
        fragmentShader,
        uniforms: {
          BgTexture: { value: textures.map_bg },
          OutlineTexture: { value: textures.map },
          ShadesmarBgTexture: { value: textures.shadesmar_map_bg },
          TransitionTexture: { value: textures.transition },
          Transition: { value: this.transitionValue }
        }
      })

      const textPattern = textures.text_pattern
      textPattern.wrapS = RepeatWrapping
      textPattern.wrapT = RepeatWrapping
      textPattern.magFilter = NearestFilter

      const textMaterial = new ShaderMaterial({
        // language=GLSL
        vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 0), 1.0);
        }
      `,
        fragmentShader: textFragmentShader,
        uniforms: {
          Texture: { value: textures.map_text },
          ShadesmarTexture: { value: textures.shadesmar_map_text },
          PatternTexture: { value: textPattern },
          TransitionTexture: { value: textures.transition },
          Transition: { value: this.transitionValue }
        },
        transparent: true,
        depthTest: false
      })
      this.plane = new Mesh(geo, mapMaterial)
      this.plane.frustumCulled = false

      this.textPlane = new Mesh(geo, textMaterial)
      this.textPlane.position.z = 1
      this.textPlane.frustumCulled = false

      this.scene = new Scene()
      this.scene.add(this.plane, this.textPlane, this.highlights, new AmbientLight(0x222222))
    },
    onHighlightPositionChanged (newPosition) {
      this.highlights.children.forEach(h => h.leave())

      if (newPosition === null) {
        return
      }

      const target = new Vector3(newPosition.x - 512, 256 - newPosition.y, 0)
      this.highlights.add(new Highlight(target.x, target.y))
      this.controls.transitionTo(target, 0.7)
    },
    onShadesmarChanged (shouldShow) {
      if (shouldShow) {
        this.transitionDirection = 1
      } else {
        this.transitionDirection = -2
      }
    },
    update (timestamp) {
      this.resizeCanvasToDisplaySize()
      this.transitionValue += this.transitionDirection * 0.01

      if (this.transitionValue <= 0 || this.transitionValue >= 1) {
        this.transitionValue = Math.max(0, Math.min(this.transitionValue, 1))
        this.transitionDirection = 0
      }

      this.plane.material.uniforms.Transition.value = this.transitionValue
      this.textPlane.material.uniforms.Transition.value = this.transitionValue

      this.highlights.children.forEach(h => h.update(this.camera, timestamp))

      this.controls.update()
      this.renderer.render(this.scene, this.camera)
      this.latestAnimationFrame = requestAnimationFrame(this.update)
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
