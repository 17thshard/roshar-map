<template>
  <div class="map">
    <span
      data-tutorial-id="location"
      class="map__tutorial-ref"
      :style="{ left: `${tutorialReferencePosition.x}%`, top: `${tutorialReferencePosition.y}%` }"
    />
    <transition name="map__factions-legend">
      <FactionsLegend v-if="layers.factions !== undefined && layers.factions.t > 0.5" class="map__factions-legend" />
    </transition>
  </div>
</template>

<script>
import {
  Group,
  LuminanceFormat,
  Mesh,
  NearestFilter,
  PerspectiveCamera,
  PlaneBufferGeometry,
  RepeatWrapping,
  RGBFormat,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  // eslint-disable-next-line camelcase
  RGB_S3TC_DXT1_Format
} from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { mapState } from 'vuex'
// #ifdef MAP_DEBUG
import Stats from 'stats.js'
// #endif
import MapControls from '@/components/map/MapControls'
import Highlight from '@/components/map/layers/Highlight'
import fragmentShader from '@/components/map/mapFragmentShader'
import textFragmentShader from '@/components/map/mapTextFragmentShader'
import ShatteringPass from '@/components/map/ShatteringPass'
import TextureManager from '@/components/map/TextureManager'
import { clamp01, lerp } from '@/utils'
import Factions from '@/components/map/layers/Factions'
import Graticule from '@/components/map/layers/Graticule'
import SilverKingdoms from '@/components/map/layers/SilverKingdoms'
import Oathgates from '@/components/map/layers/Oathgates'
import Shadesmar from '@/components/map/layers/Shadesmar'
import FactionsLegend from '@/components/map/layers/FactionsLegend.vue'
import Measurement from '@/components/map/Measurement'

export default {
  name: 'Map',
  components: { FactionsLegend },
  props: {
    transitions: {
      type: Boolean
    }
  },
  data () {
    return {
      textHoverProgress: 0,
      textActiveProgress: 0,
      perpendicularityTransition: 0,
      perpendicularityTransitionDirection: 0,
      dimmingProgress: 0,
      dimmingProgressDirection: 0,
      layers: {},
      tutorialReferencePosition: {
        x: 0,
        y: 0
      }
    }
  },
  computed: {
    ...mapState(['layersActive', 'measurementActive']),
    activeLocation () {
      return this.transitions && this.$route.name === 'locations' ? this.$store.state.mappings.locations[this.$route.params.id] : null
    },
    activeEvent () {
      return this.transitions ? this.$store.state.activeEvent : null
    }
  },
  watch: {
    activeEvent (event, oldEvent) {
      this.onEventChanged(event, oldEvent)
    },
    activeLocation (location, oldLocation) {
      this.onLocationChanged(location, oldLocation)
    },
    layersActive: {
      handler (layersActive) {
        this.updateLayers(layersActive)
      },
      deep: true
    },
    '$route.query.speed' (newSpeed) {
      if (newSpeed !== undefined) {
        this.controls.keyboardSpeed = Number.parseFloat(newSpeed)
      }
    },
    measurementActive () {
      this.measurement.reset()
    }
  },
  mounted () {
    try {
      this.renderer = new WebGLRenderer({ antialias: false, alpha: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.sortObjects = false

      this.textureManager = new TextureManager(this.renderer, this.$t('textureLocale'))

      this.composer = new EffectComposer(this.renderer)
    } catch (error) {
      this.$emit('error', error)
      return
    }

    // #ifdef MAP_DEBUG
    this.stats = new Stats()
    this.stats.dom.style.width = '80px'
    this.stats.dom.style.right = '0px'
    document.body.appendChild(this.stats.dom)
    // #endif

    this.loadTextures()
      .then(this.setupScene)
      .then(() => {
        this.$el.prepend(this.renderer.domElement)

        Object.keys(this.layers).forEach((layer) => {
          this.layers[layer].changeVisibility = false
        })
        this.updateLayers(this.layersActive)
        this.update()
        Object.keys(this.layersActive).forEach((layer) => {
          if (!this.layersActive[layer] && !this.isLayerActivatedByEntry(layer)) {
            this.layers[layer].visible = false
          }
          this.layers[layer].changeVisibility = true
        })

        this.$emit('ready')

        this.onEventChanged(this.activeEvent, null)
        this.onLocationChanged(this.activeLocation, null)
      })
      .catch((error) => {
        this.$emit('error', error)
      })
  },
  destroyed () {
    this.renderer.dispose()
    cancelAnimationFrame(this.latestAnimationFrame)

    // #ifdef MAP_DEBUG
    this.stats.dom.remove()
    // #endif
  },
  methods: {
    loadTextures () {
      const textures = {
        map_bg: { hqAvailable: true, lossy: true, pixelFormat: RGBFormat, compressedPixelFormat: RGB_S3TC_DXT1_Format },
        map: { hqAvailable: true, pixelFormat: RGBFormat },
        shadesmar_map_bg: { lossy: true, pixelFormat: RGBFormat, compressedPixelFormat: RGB_S3TC_DXT1_Format },
        transition: { pixelFormat: LuminanceFormat },
        text_pattern: { pixelFormat: LuminanceFormat },
        map_text: { hqAvailable: true, localized: true, pixelFormat: RGBFormat },
        shadesmar_map_text: { hqAvailable: true, localized: true, pixelFormat: RGBFormat },
        factions: { hqAvailable: true, lossy: true, pixelFormat: RGBFormat },
        oathgates_text: { hqAvailable: true, localized: true, pixelFormat: LuminanceFormat },
        silver_kingdoms: { hqAvailable: true, pixelFormat: LuminanceFormat },
        silver_kingdoms_text: { hqAvailable: true, localized: true, pixelFormat: LuminanceFormat },
        graticule: { hqAvailable: true, lossy: true, pixelFormat: RGBFormat },
        graticule_text: { hqAvailable: true, pixelFormat: LuminanceFormat }
      }

      return this.textureManager.load(textures)
    },
    async setupScene (textures) {
      this.camera = new PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        1e3
      )
      this.camera.position.set(30, -10, 40)

      this.controls = new MapControls(this.camera, this.renderer.domElement)
      this.controls.addEventListener('click', ({ position }) => {
        if (this.measurementActive) {
          this.measurement.click(position)
          return
        }

        this.textActiveProgress = 1
        const location = this.queryHover(position.x, position.y)

        if (location !== null && (this.activeLocation === null || location !== this.activeLocation.mapId)) {
          this.$router.push(`/${this.$route.params.locale}/locations/${this.$store.state.locationsByMapId[location].id}`)
        } else if (location === null) {
          if (this.$route.name !== 'root') {
            this.$router.push(`/${this.$route.params.locale}`)
          } else {
            this.$store.commit('unselectEvent')
          }
        }
      })
      this.controls.addEventListener('move', ({ position }) => {
        if (this.measurementActive) {
          this.measurement.updateHover(position)
        }
      })
      const customSpeed = this.$route.query.speed
      if (customSpeed !== undefined) {
        this.controls.keyboardSpeed = Number.parseFloat(customSpeed)
      }

      this.highlights = new Group()

      const geo = new PlaneBufferGeometry(2, 2, 1, 1)
      this.mapMaterial = new ShaderMaterial({
        // language=GLSL
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 1.0), 1.0);
          }
        `,
        fragmentShader,
        uniforms: {
          BgTexture: { value: textures.map_bg },
          OutlineTexture: { value: textures.map },
          ShadesmarBgTexture: { value: textures.shadesmar_map_bg },
          TransitionTexture: { value: textures.transition },
          Transition: { value: 0 },
          PerpTransition: { value: 0 },
          PerpLocation: { value: new Vector2() },
          PerpPeriod: { value: 3.05355 },
          DimTransition: { value: this.dimmingProgress },
          Time: { value: 0 }
        },
        extensions: {
          derivatives: true
        }
      })

      textures.text_pattern.wrapS = RepeatWrapping
      textures.text_pattern.wrapT = RepeatWrapping
      textures.text_pattern.magFilter = NearestFilter

      const textMaterial = new ShaderMaterial({
        // language=GLSL
        vertexShader: `
          varying vec2 vUv;

          void main() {
            vUv = uv;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 1.0), 1.0);
          }
        `,
        fragmentShader: textFragmentShader,
        uniforms: {
          Texture: { value: textures.map_text },
          ShadesmarTexture: { value: textures.shadesmar_map_text },
          PatternTexture: { value: textures.text_pattern },
          TransitionTexture: { value: textures.transition },
          Transition: { value: 0 },
          HoveredItem: { value: 0 },
          ActiveItem: { value: 0 },
          HoverProgress: { value: 0 },
          ActiveProgress: { value: 0 },
          Opacity: { value: 1 }
        },
        extensions: {
          derivatives: true
        },
        transparent: true,
        depthTest: false
      })

      this.plane = new Mesh(geo, this.mapMaterial)
      this.plane.frustumCulled = false

      this.textPlane = new Mesh(geo, textMaterial)
      this.textPlane.position.z = 1
      this.textPlane.frustumCulled = false

      this.layers = {
        shadesmar: new Shadesmar(),
        graticule: new Graticule(textures),
        silverKingdoms: new SilverKingdoms(textures),
        oathgates: new Oathgates(textures),
        factions: new Factions(textures.factions)
      }
      this.measurement = new Measurement()

      this.scene = new Scene()
      this.scene.add(
        this.plane,
        this.layers.graticule,
        this.textPlane,
        this.highlights,
        this.layers.factions,
        this.layers.silverKingdoms,
        this.layers.oathgates,
        this.measurement
      )

      this.composer.addPass(new RenderPass(this.scene, this.camera))
      this.shatteringPass = new ShatteringPass()
      this.composer.addPass(this.shatteringPass)

      this.hoverTexture = await this.textureManager.loadData('hover_text', false, true, false, 'gb')
    },
    onEventChanged (event, oldEvent) {
      this.highlights.children.forEach(h => h.leave())

      this.perpendicularityTransitionDirection = event !== null && event.perpendicularity ? 1 : -1

      if (event !== null && event.shadesmar) {
        this.enterLayer('shadesmar')
      } else if (oldEvent !== null && oldEvent.shadesmar && !this.layersActive.shadesmar) {
        this.leaveLayer('shadesmar')
      }

      if (event !== null && event.specialEffect === 'shattering') {
        this.shatteringPass.enter()
      } else if (oldEvent !== null && oldEvent.specialEffect === 'shattering') {
        this.shatteringPass.leave()
      }

      if (event !== null && event.specialEffect === 'factions') {
        this.enterLayer('factions')
      } else if (oldEvent !== null && oldEvent.specialEffect === 'factions' && !this.layersActive.factions) {
        this.leaveLayer('factions')
      }

      if (event === null) {
        return
      }

      const newPosition = event.coordinates
      const target = new Vector3(newPosition.x - 512, 256 - newPosition.y, 0)

      if (event.hideMarker !== true) {
        this.highlights.add(new Highlight(target.x, target.y, event.specialEffect === 'shattering' ? 2 : undefined))
      }

      if (event.perpendicularity) {
        this.mapMaterial.uniforms.PerpLocation.value.set(target.x, target.y)
      }

      this.$nextTick(() => {
        const cardHeight = document.querySelector(`.event-card[data-id="${event.id}"]`).clientHeight
        this.controls.transitionTo(target.setY(target.y - 10), newPosition.zoom !== undefined ? newPosition.zoom : 0.7, cardHeight)
      })
    },
    onLocationChanged (location, oldLocation) {
      if (location !== null && location.shadesmar) {
        this.enterLayer('shadesmar')
      } else if (oldLocation !== null && oldLocation.shadesmar && !this.layersActive.shadesmar) {
        this.leaveLayer('shadesmar')
      }

      if (location === null) {
        return
      }

      const newPosition = location.coordinates
      const target = new Vector3(newPosition.x - 512, 256 - newPosition.y, 0)

      this.controls.transitionTo(target, newPosition.zoom !== undefined ? newPosition.zoom : 0.7)
    },
    update (timestamp) {
      // #ifdef MAP_DEBUG
      this.stats.begin()
      // #endif
      this.resizeCanvasToDisplaySize()

      let delta = 0
      if (timestamp !== undefined && this.lastTimestamp !== undefined) {
        delta = timestamp - this.lastTimestamp
      }

      this.perpendicularityTransition += this.perpendicularityTransitionDirection * 0.003 * delta

      if (this.perpendicularityTransition <= 0 || this.perpendicularityTransition >= 1) {
        this.perpendicularityTransition = clamp01(this.perpendicularityTransition)
        this.perpendicularityTransitionDirection = 0
      }

      this.dimmingProgress += this.dimmingProgressDirection * 0.003 * delta

      if (this.dimmingProgress <= 0 || this.dimmingProgress >= 1) {
        this.dimmingProgress = clamp01(this.dimmingProgress)
        this.dimmingProgressDirection = 0
      }

      this.highlights.children.forEach(h => h.update(this.camera, timestamp, delta))
      Object.values(this.layers).forEach(h => h.update(this.camera, timestamp, delta))

      this.controls.update(delta)

      const tutorialPos = new Vector3(206.9, -21.2, 0)
      tutorialPos.project(this.camera)

      this.tutorialReferencePosition.x = (tutorialPos.x + 1) * 0.5 * 100
      this.tutorialReferencePosition.y = (1 - tutorialPos.y) * 0.5 * 100

      this.mapMaterial.uniforms.PerpTransition.value = this.perpendicularityTransition
      this.mapMaterial.uniforms.DimTransition.value = this.dimmingProgress
      this.mapMaterial.uniforms.Time.value = timestamp / 1000

      this.mapMaterial.uniforms.Transition.value = this.layers.shadesmar.progress
      this.textPlane.material.uniforms.Transition.value = this.layers.shadesmar.progress
      this.textPlane.material.uniforms.Opacity.value = lerp(0.5, 1, 1 - this.dimmingProgress)

      document.body.style.cursor = 'initial'

      if (this.measurementActive) {
        document.body.style.cursor = 'crosshair'
        this.measurement.update(this.camera, timestamp, delta)
      }

      this.updateTextHighlights(delta)

      this.textPlane.material.uniforms.HoveredItem.value = this.lastHoveredItem !== null ? this.lastHoveredItem : 0
      this.textPlane.material.uniforms.HoverProgress.value = this.textHoverProgress

      this.textPlane.material.uniforms.ActiveItem.value = this.lastActiveLocation !== null ? this.lastActiveLocation : 0
      this.textPlane.material.uniforms.ActiveProgress.value = this.textActiveProgress

      this.composer.render(delta)

      this.lastTimestamp = timestamp

      // #ifdef MAP_DEBUG
      this.stats.end()
      // #endif

      this.latestAnimationFrame = requestAnimationFrame(this.update)
    },
    updateTextHighlights (delta) {
      const hoveredItem = this.queryHover(this.controls.textHoverPosition.x, this.controls.textHoverPosition.y)

      this.textHoverProgress = clamp01(this.textHoverProgress + (hoveredItem !== null ? 0.006 : -0.006) * delta)

      if (hoveredItem !== this.lastHoveredItem && hoveredItem !== null) {
        this.textHoverProgress = 0
        this.lastHoveredItem = hoveredItem
      } else if (hoveredItem !== this.lastHoveredItem && hoveredItem === null && this.textHoverProgress === 0) {
        this.lastHoveredItem = null
      }

      if (hoveredItem !== null) {
        document.body.style.cursor = 'pointer'
      }

      this.textActiveProgress = clamp01(this.textActiveProgress + (this.activeLocation !== null ? 0.0 : -0.006) * delta)

      if (this.activeLocation !== this.lastActiveLocation && this.activeLocation !== null) {
        this.textActiveProgress = 1
        this.lastActiveLocation = this.activeLocation.mapId
      } else if (this.activeLocation !== this.lastActiveLocation && this.activeLocation === null && this.textActiveProgress === 0) {
        this.lastActiveLocation = null
      }
    },
    queryHover (x, y) {
      if (this.hoverTexture === undefined || this.measurementActive) {
        return null
      }

      const hoverX = Math.trunc((x + 512) * this.hoverTexture.width / 1024)
      const hoverY = Math.trunc((256 - y) * this.hoverTexture.height / 512)

      const hoveredItem = this.hoverTexture.data[(hoverY * this.hoverTexture.width + hoverX) * 2 + (this.layers.shadesmar.enabled ? 0 : 1)]
      if (hoveredItem === undefined || hoveredItem <= 0) {
        return null
      }

      return hoveredItem
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
    },
    enterLayer (layer) {
      const layerData = this.layers[layer]

      layerData.enter()

      if (layerData.dimming) {
        this.dimmingProgressDirection = 1
      }
    },
    leaveLayer (layer) {
      const layerData = this.layers[layer]

      layerData.leave()

      if (layerData.dimming && Object.keys(this.layersActive)
        .filter(l => l !== layer)
        .every(l => this.layers[l].dimming ? !this.layersActive[l] && !this.isLayerActivatedByEntry(l) : true)) {
        this.dimmingProgressDirection = -1
      }
    },
    updateLayers (layersActive) {
      Object.keys(layersActive).forEach((layer) => {
        if (layersActive[layer]) {
          this.enterLayer(layer)
        } else if (!layersActive[layer] && !this.isLayerActivatedByEntry(layer)) {
          this.leaveLayer(layer)
        }
      })
    },
    isLayerActivatedByEntry (layer) {
      if (this.activeEvent === null) {
        return layer === 'shadesmar' && this.activeLocation !== null ? this.activeLocation.shadesmar : false
      }

      if (layer === 'shadesmar') {
        return this.activeEvent.shadesmar
      }

      if (layer === 'factions') {
        return this.activeEvent.specialEffect === 'factions'
      }

      return false
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
  height: 100%;
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

  &__tutorial-ref {
    position: absolute;
    pointer-events: none;
  }

  &__factions-legend {
    position: absolute;
    top: 2rem;
    z-index: 11;

    [dir=ltr] & {
      left: 2rem;
    }

    [dir=rtl] & {
      right: 2rem;
    }

    @media (max-width: 640px) {
      top: 6rem;

      [dir=ltr] & {
        right: 2rem;
      }

      [dir=rtl] & {
        left: 2rem;
      }
    }

    &-enter-active, &-leave-active {
      transition: opacity 0.3s ease-in-out;
    }

    &-enter, &-leave-to {
      opacity: 0;
    }

    &-enter-to, &-leave {
      opacity: 1;
    }
  }
}
</style>
