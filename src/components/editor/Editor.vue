<template>
  <div class="editor">
    <div class="editor__menu">
      <img src="@/assets/roshar_logo.png" alt="Logo">
      Mode:
      <label for="editor__mode--locations">
        <input id="editor__mode--locations" v-model="mode" type="radio" value="locations">
        Locations
      </label>
      <label for="editor__mode--events">
        <input id="editor__mode--events" v-model="mode" type="radio" value="events">
        Events
      </label>

      <div class="editor__file">
        <label for="editor__file--locations">
          Locations file:
        </label>

        <input id="editor__file--locations" type="file" @change="loadLocations">

        <button @click="saveLocations">
          Save
        </button>

        <button @click="exportLocations">
          Export
        </button>
      </div>

      <div class="editor__file">
        <label for="editor__file--events">
          Events file:
        </label>

        <input id="editor__file--events" type="file" @change="loadEvents">

        <button @click="saveEvents">
          Save
        </button>
      </div>
    </div>
    <div
      ref="surface"
      class="editor__surface"
      :style="{ transform: `scale(${zoom}, ${zoom}) translate(${-offset.x}px, ${offset.y}px)`, '--zoom': zoom }"
      @click="click"
      @mousedown="startPan"
      @mousemove="drag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @mousewheel="onZoom"
      @DOMMouseScroll="onZoom"
    >
      <svg v-if="mode === 'locations'">
        <template
          v-for="(polygon, index) in locations"
        >
          <polygon
            :key="`polygon${index}`"
            :points="buildPolygonPoints(polygon)"
            :class="selectedLocation === polygon ? 'editor__surface-polygon--selected' : undefined"
            @click="clickPolygon($event, polygon, index)"
          />
          <circle
            v-for="(point, pointIndex) in polygon.points"
            :key="`polygon${index}-point${pointIndex}`"
            :cx="point.x / xScale"
            :cy="point.y / yScale"
            :class="newLocation === polygon && pointIndex === 0 ? 'editor__surface-point--first' : undefined"
            :r="5 / zoom"
            @click="clickPoint($event, polygon, index, pointIndex)"
            @mousedown="startDrag($event, point)"
          />
        </template>
      </svg>
      <div
        v-if="mode === 'events' && selectedEvent !== null"
        class="editor__selected-event"
        :style="{ left: `${selectedEvent.coordinates.x / xScale}px`, top: `${selectedEvent.coordinates.y / yScale}px` }"
      />
    </div>
    <canvas ref="referenceCanvas" class="editor__reference" width="1024" height="512" />
    <ul v-if="mode === 'locations'" class="editor__location-list">
      <li>
        <button @click="sortPolygonsById">
          Sort by ID
        </button>
        <button @click="renderPng(locations, 'map_text')">
          Save LQ
        </button>
        <button @click="renderPng(locations, 'hq_map_text')">
          Save HQ
        </button>
        <button @click="renderPng(locations)">
          Save hover
        </button>
      </li>
      <li
        v-for="(location, index) in locations"
        :key="`location${index}`"
        :class="selectedLocation === location ? 'editor__location-list-item--selected' : undefined"
      >
        <input v-model="location.id" type="number" min="1" max="255" aria-label="Area ID">
        <input v-model="location.name" type="text" aria-label="Area name">
        <button @click="deleteLocation(index)">
          Delete
        </button>
      </li>
    </ul>
    <ul v-else-if="mode === 'events'" class="editor__event-list" @click.self="selectedEvent = null">
      <li>
        <button @click="sortEvents">
          Sort
        </button>
        <button @click="addEvent">
          New
        </button>
        <button @click="selectedEvent = null">
          Clear selection
        </button>
      </li>
      <li
        v-for="(event, index) in events"
        :key="`event${index}`"
        :class="selectedEvent === event ? 'editor__event-list-item--selected' : undefined"
        @click="selectedEvent = event"
      >
        <span class="editor__event-list-date">
          <span class="editor__event-list-date-year">
            {{ event.date[0] }}
          </span>
          {{ event.date.length > 1 ? '.' : '' }}
          <span v-if="event.date.length > 1" class="editor__event-list-date-rest">
            {{ event.date.slice(1).join('.') }}
          </span>
        </span>
        <span>{{ event.id }}</span>
        <button @click.stop="deleteEvent(index)">
          Delete
        </button>
      </li>
    </ul>
    <EventProperties
      v-if="mode === 'events' && selectedEvent !== null"
      :event="selectedEvent"
    />
  </div>
</template>

<script>
/* eslint-disable no-param-reassign */

import { Mesh, OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer } from 'three'
import mapFragmentShader from '@/components/map/mapFragmentShader'
import textFragmentShader from '@/components/editor/editorTextFragmentShader'
import TextureManager from '@/components/map/TextureManager'
import EventProperties from '@/components/editor/EventProperties.vue'

function saveAs (blob, name) {
  const a = document.createElement('a')

  a.download = name
  a.rel = 'noopener' // tabnabbing

  // Support blobs
  a.href = URL.createObjectURL(blob)
  setTimeout(function () {
    URL.revokeObjectURL(a.href)
  }, 4e4) // 40s
  setTimeout(function () {
    a.click()
  }, 0)
}

export default {
  name: 'Editor',
  components: { EventProperties },
  data () {
    return {
      mode: 'events',
      locations: [],
      events: [],
      newLocation: null,
      selectedLocation: null,
      selectedEvent: null,
      draggedPoint: null,
      zoom: 1,
      offset: { x: 0, y: 0 },
      panning: 0,
      panStart: null,
      xScale: 1,
      yScale: 1
    }
  },
  watch: {
    zoom (value) {
      this.camera.zoom = value
      this.camera.updateProjectionMatrix()
    },
    offset: {
      handler ({ x, y }) {
        this.camera.position.set(x * this.xScale, y * this.yScale, 0)
        this.camera.updateProjectionMatrix()
      },
      deep: true
    }
  },
  mounted () {
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(0x000000)
    this.renderer.sortObjects = false

    this.textureManager = new TextureManager(this.renderer)

    this.loadTextures()
      .then(this.setupScene)
      .then(() => {
        this.$el.appendChild(this.renderer.domElement)

        this.update()

        this.$emit('ready')
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
        map_text: { hqAvailable: true },
        shadesmar_map_text: { hqAvailable: true }
      }

      return this.textureManager.load(textures)
    },
    setupScene (textures) {
      this.camera = new OrthographicCamera(
        -512,
        512,
        256,
        -256,
        0,
        1
      )

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
        fragmentShader: mapFragmentShader,
        uniforms: {
          BgTexture: { value: textures.map_bg },
          OutlineTexture: { value: textures.map },
          ShadesmarBgTexture: { value: textures.shadesmar_map_bg },
          TransitionTexture: { value: textures.transition },
          Transition: { value: 0 },
          PerpTransition: { value: 0 },
          PerpLocation: { value: new Vector2() },
          PerpPeriod: { value: 3.05355 },
          Time: { value: 0 }
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

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 0), 1.0);
          }
        `,
        fragmentShader: textFragmentShader,
        uniforms: {
          Texture: { value: textures.map_text },
          ShadesmarTexture: { value: textures.shadesmar_map_text }
        },
        transparent: true,
        depthTest: false
      })

      this.mapPlane = new Mesh(geo, mapMaterial)
      this.mapPlane.position.z = 0
      this.mapPlane.frustumCulled = false

      this.textPlane = new Mesh(geo, textMaterial)
      this.textPlane.position.z = 0
      this.textPlane.frustumCulled = false

      this.scene = new Scene()
      this.scene.add(this.mapPlane, this.textPlane)
    },
    update (timestamp) {
      this.resizeCanvasToDisplaySize()

      this.mapPlane.material.uniforms.Time.value = timestamp / 1000

      if (this.selectedEvent !== null) {
        this.mapPlane.material.uniforms.Transition.value = this.selectedEvent.shadesmar ? 1 : 0
        this.mapPlane.material.uniforms.PerpTransition.value = this.selectedEvent.perpendicularity ? 1 : 0
        this.mapPlane.material.uniforms.PerpLocation.value.set(
          this.selectedEvent.coordinates.x - 512,
          256 - this.selectedEvent.coordinates.y
        )
      } else {
        this.mapPlane.material.uniforms.Transition.value = 0
        this.mapPlane.material.uniforms.PerpTransition.value = 0
      }

      this.renderer.render(this.scene, this.camera)
      this.latestAnimationFrame = requestAnimationFrame(this.update)
    },
    resizeCanvasToDisplaySize () {
      this.xScale = 1024 / this.$refs.surface.clientWidth
      this.yScale = 512 / this.$refs.surface.clientHeight
      const canvas = this.renderer.domElement
      // look up the size the canvas is being displayed
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      // adjust displayBuffer size to match
      if (canvas.width !== width || canvas.height !== height) {
        // you must pass false here or three.js sadly fights the browser
        this.renderer.setSize(width, height, false)
        this.camera.updateProjectionMatrix()
        // update any render target sizes here
      }
    },
    loadLocations (event) {
      if (event.target.files.length === 0) {
        return
      }

      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.locations = JSON.parse(fileReader.result)
        this.selectedLocation = null
        this.mode = 'locations'
      }
      fileReader.readAsText(event.target.files[0])

      // eslint-disable-next-line no-param-reassign
      event.target.value = ''
    },
    saveLocations () {
      saveAs(
        new Blob([JSON.stringify(this.locations, undefined, 4)], { type: 'application/json;charset=utf-8' }),
        'locations-editable.json'
      )
    },
    exportLocations () {
      const exportLocations = [...this.locations].sort((a, b) => a.id - b.id).reduce((acc, location) => ({
        ...acc,
        [location.id]: {
          id: location.name
        }
      }), {})

      saveAs(
        new Blob([JSON.stringify(exportLocations, undefined, 4)], { type: 'application/json;charset=utf-8' }),
        'locations.json'
      )
    },
    loadEvents (event) {
      if (event.target.files.length === 0) {
        return
      }

      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.events = JSON.parse(fileReader.result)
        this.selectedEvent = null
        this.mode = 'events'
      }
      fileReader.readAsText(event.target.files[0])

      // eslint-disable-next-line no-param-reassign
      event.target.value = ''
    },
    saveEvents () {
      saveAs(
        new Blob([JSON.stringify(this.events, undefined, 4)], { type: 'application/json;charset=utf-8' }),
        'events.json'
      )
    },
    addEvent () {
      this.selectedEvent = { id: 'new-event', date: [1170], tags: [], coordinates: { x: 0, y: 0 } }
      this.events.push(this.selectedEvent)
    },
    deleteEvent (index) {
      this.selectedEvent = null
      this.events.splice(index, 1)
    },
    deleteLocation (index) {
      this.selectedLocation = null
      this.locations.splice(index, 1)
    },
    click (event) {
      if (this.draggedPoint !== null || event.altKey || this.panning || event.button === 1) {
        return
      }

      const { clientX, clientY, shiftKey } = event
      const { x, y } = this.transform(clientX, clientY)

      if (this.mode === 'events') {
        if (this.selectedEvent !== null) {
          this.selectedEvent.coordinates = { x: Number.parseFloat(x.toFixed(1)), y: Number.parseFloat(y.toFixed(1)) }
        }

        return
      }

      if (this.newLocation !== null) {
        this.newLocation.points.push({ x, y })

        if (shiftKey) {
          this.newLocation = null
        }
      } else if (this.selectedLocation !== null && shiftKey) {
        this.selectedLocation.points.push({ x, y })
      } else if (this.selectedLocation !== null) {
        this.selectedLocation = null
      } else {
        this.newLocation = { name: 'New Area', id: Math.max(...this.locations.map(l => l.id)), points: [{ x, y }] }
        this.locations.push(this.newLocation)
      }
    },
    clickPolygon (event, polygon, index) {
      if (this.draggedPoint !== null) {
        return
      }

      if (event.ctrlKey) {
        this.locations.splice(index, 1)

        if (polygon === this.selectedLocation) {
          this.selectedLocation = null
        }

        if (polygon === this.newLocation) {
          this.newLocation = null
        }
      }

      if (this.newLocation !== null) {
        return
      }

      if (!event.ctrlKey) {
        this.selectedLocation = polygon
      }

      event.preventDefault()
      event.stopPropagation()
    },
    clickPoint (event, polygon, polygonIndex, pointIndex) {
      if (this.draggedPoint !== null) {
        return
      }

      if (!event.ctrlKey && polygon === this.newLocation && pointIndex === 0) {
        this.newLocation = null
      } else if (event.ctrlKey) {
        polygon.points.splice(pointIndex, 1)

        if (polygon.points.length === 0) {
          this.locations.splice(polygonIndex, 1)

          if (this.newLocation === polygon) {
            this.newLocation = null
          }

          if (this.selectedLocation === polygon) {
            this.selectedLocation = null
          }
        }
      }

      event.preventDefault()
      event.stopPropagation()
    },
    startDrag (event, point) {
      if (this.newLocation !== null || event.altKey || event.button === 1) {
        return
      }

      this.draggedPoint = point
      event.preventDefault()
      event.stopPropagation()
    },
    startPan (event) {
      if (event.altKey || event.button === 1) {
        this.panning = true
        this.panStart = { x: event.clientX, y: event.clientY }

        event.preventDefault()
        event.stopPropagation()
      }
    },
    drag (event) {
      if (this.draggedPoint !== null) {
        const { x, y } = this.transform(event.clientX, event.clientY)
        this.draggedPoint.x = x
        this.draggedPoint.y = y
      } else if (this.panning) {
        const panEnd = { x: event.clientX, y: event.clientY }
        const diffX = panEnd.x - this.panStart.x
        const diffY = panEnd.y - this.panStart.y

        this.offset = { x: this.offset.x - diffX, y: this.offset.y + diffY }

        this.panStart = panEnd
      }
    },
    endDrag (event) {
      if (this.draggedPoint !== null || this.panning) {
        event.stopPropagation()
        event.preventDefault()
      }

      this.draggedPoint = null
      this.panning = false
    },
    buildPolygonPoints (polygon) {
      return polygon.points.map(p => `${p.x / this.xScale},${p.y / this.yScale}`).join(' ')
    },
    onZoom (event) {
      const e = window.event || event
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
      this.zoom = Math.max(1, this.zoom + delta)
    },
    transform (x, y) {
      return {
        x: ((this.$refs.surface.clientWidth / 2 + (x - this.$refs.surface.clientWidth / 2) / this.zoom) + this.offset.x) * this.xScale,
        y: ((this.$refs.surface.clientHeight / 2 + (y - this.$refs.surface.clientHeight / 2) / this.zoom) - this.offset.y) * this.yScale
      }
    },
    sortEvents () {
      this.events.sort(
        (a, b) => {
          let j = 0

          for (let i = 0; i < a.date.length; i++) {
            if (j === b.date.length - 1 && b.date[j] !== a.date[i]) {
              return a.date[i] - b.date[j]
            }

            if (a.date[i] !== b.date[j]) {
              return a.date[i] - b.date[j]
            }

            j += 1
          }

          if (j !== b.date.length) {
            return -1
          }

          if (a.tieBreaker !== undefined && b.tieBreaker !== undefined) {
            return a.tieBreaker - b.tieBreaker
          } else if (a.tieBreaker !== undefined) {
            return 1
          }

          return -1
        }
      )
    },
    sortPolygonsById () {
      this.locations.sort((a, b) => a.id - b.id)
    },
    async renderPng (polygons, base) {
      const { width, height, data: baseData } = base !== undefined
        ? (await this.textureManager.loadData(base, false, 'rgba'))
        : { width: 1024, height: 512 }

      const xScale = width / 1024
      const yScale = height / 512
      const svgString = `
      <svg xmlns='http://www.w3.org/2000/svg' shape-rendering="crispEdges" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${
        polygons.map(polygon =>
          `<polygon fill="#${Number.parseInt(polygon.id, 10).toString(16).padStart(6, '0')}" points="${
            polygon.points.map(p => `${(p.x * xScale).toFixed(5)},${(p.y * yScale).toFixed(5)}`).join(' ')
          }"></polygon>`
        ).join('\n')
      }
      </svg>
      `

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = function () {
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0)
        const hoverData = ctx.getImageData(0, 0, width, height).data

        if (base !== undefined) {
          for (let i = 0; i < hoverData.length / 4; i++) {
            baseData[i * 4 + 2] = hoverData[i * 4 + 2]
          }
        }

        if (base !== undefined) {
          ctx.clearRect(0, 0, width, height)
          ctx.putImageData(new ImageData(baseData, width, height), 0, 0)
        }

        const png = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display: none'
        a.href = png
        a.download = `${base !== undefined ? base : 'hover'}.png`
        a.click()
        window.URL.revokeObjectURL(png)

        a.remove()
        canvas.remove()
      }
      img.src = `data:image/svg+xml;base64,${window.btoa(svgString)}`
    }
  }
}
</script>

<style lang="scss">
.editor {
  display: flex;
  align-items: stretch;
  justify-content: stretch;
  flex: 1;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  padding-bottom: 50%;
  font-family: sans-serif;

  &__menu {
    position: absolute;
    top: 0;
    height: 100px;
    left: 0;
    right: 0;
    background: #848d97;
    z-index: 11;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    box-sizing: border-box;
    padding: 1rem 0.5rem;
    display: flex;
    align-items: center;

    img {
      max-height: 100%;
      margin-right: 0.5rem;
    }

    label {
      display: flex;
      align-items: center;

      input {
        padding: 0;
        margin: 0 0.25rem 0 0.5rem;
      }
    }
  }

  &__file {
    display: flex;
    align-items: center;
    margin: 0 1rem;

    label {
      margin-right: 0.5rem;
    }
  }

  canvas {
    width: 100% !important;
    height: 100% !important;
    z-index: 0;
    position: absolute;

    &:focus {
      outline: none;
    }
  }

  &__surface {
    width: 100% !important;
    height: 100% !important;
    z-index: 1;
    position: absolute;
    transform-origin: 50% 50%;

    svg {
      width: 100%;
      height: 100%;
    }

    polygon {
      stroke: #0f3562;
      fill: rgba(#0f3562, 0.5);
      stroke-width: calc(1 / var(--zoom));

      &:hover {
        fill: rgba(#0f3562, 0.7);
        cursor: pointer;
      }
    }

    circle {
      stroke: #0f3562;
      fill: white;
      stroke-width: calc(2 / var(--zoom));

      &:hover {
        fill: #4d8dd9;
        cursor: move;
      }
    }

    &-polygon--selected {
      fill: rgba(#62220f, 0.5) !important;

      &:hover {
        fill: rgba(#62220f, 0.5) !important;
      }
    }

    &-point--first {
      stroke-width: calc(3 / var(--zoom)) !important;
    }
  }

  &__location-list {
    list-style-type: none;
    position: absolute;
    top: 100px;
    left: 0;
    bottom: 0;
    width: 350px;
    background: #848d97;
    overflow-y: auto;
    margin: 0;
    z-index: 10;
    box-sizing: border-box;
    padding: 1rem 0 0;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);

    li {
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-gap: 0.5rem;
      padding: 0.5rem;

      &:first-child {
        button:first-child {
          grid-column: 1 / span 3;
        }

        grid-template-columns: auto auto auto;
      }
    }

    &-item--selected {
      background: red;
    }
  }

  &__event-list {
    list-style-type: none;
    position: absolute;
    top: 100px;
    left: 0;
    bottom: 0;
    width: 350px;
    background: #848d97;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
    overflow-y: auto;
    margin: 0;
    z-index: 10;
    box-sizing: border-box;
    padding: 1rem 0 0;

    li {
      display: grid;
      grid-template-columns: 70px minmax(0, 1fr) auto;
      grid-gap: 0.5rem;
      padding: 0.5rem 1rem;
      cursor: pointer;

      &:first-child {
        cursor: default;
        pointer-events: none;
        grid-template-columns: auto auto;

        button {
          pointer-events: auto;
        }

        button:first-child {
          grid-column: 1 / span 2;
        }
      }

      input[type='text']:first-child {
        width: 50px;
      }
    }

    &-item--selected {
      color: #fafafa;
      background: #0f3562;
    }

    &-date {
      display: flex;

      &-year {
        width: 50px;
        text-align: right;
      }

      &-rest {
        text-align: left;
      }
    }
  }

  &__selected-event {
    position: absolute;
    width: 0.75rem;
    height: 0.75rem;
    margin-left: -0.375rem;
    margin-top: -0.375rem;
    background: red;
    box-sizing: border-box;
    border-radius: 100%;
  }

  canvas.editor__reference {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1024px !important;
    height: 512px !important;
  }

  &__input--invalid {
    outline: 2px solid red !important;
  }

  .event-properties {
    position: absolute;
    top: 100px;
    right: 0;
    bottom: 0;
    overflow-y: auto;
    margin: 0;
    z-index: 10;
    background: #848d97;
    box-shadow: 0 0 1rem rgba(0, 0, 0, 0.5);
  }
}
</style>
