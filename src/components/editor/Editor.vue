<template>
  <div class="editor">
    <svg
      ref="surface"
      :style="{ transform: `scale(${zoom}, ${zoom}) translate(${-offset.x}px, ${offset.y}px)`, '--zoom': zoom }"
      class="editor__surface"
      @click="edit"
      @mousedown="startPan"
      @mousemove="drag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
      @mousewheel="onZoom"
      @DOMMouseScroll="onZoom"
    >
      <template
        v-for="(polygon, index) in polygons"
      >
        <polygon
          :key="`polygon${index}`"
          :points="buildPolygonPoints(polygon)"
          :class="selectedPolygon === polygon ? 'editor__surface-polygon--selected' : undefined"
          @click="clickPolygon($event, polygon, index)"
        />
        <circle
          v-for="(point, pointIndex) in polygon.points"
          :key="`polygon${index}-point${pointIndex}`"
          :cx="point.x"
          :cy="point.y"
          :class="newPolygon === polygon && pointIndex === 0 ? 'editor__surface-point--first' : undefined"
          :r="5 / zoom"
          @click="clickPoint($event, polygon, index, pointIndex)"
          @mousedown="startDrag($event, point)"
        />
      </template>
    </svg>
    <canvas ref="referenceCanvas" class="editor__reference" width="1024" height="512" />
    <ul class="editor__list">
      <li>
        <button @click="sortPolygonsById">
          Sort by ID
        </button>
        <button @click="renderPng(polygons, 8192, 4096, true)">
          Save overlayed
        </button>
        <button @click="renderPng(polygons, 1024, 512)">
          Save hover
        </button>
      </li>
      <li
        v-for="(polygon, index) in polygons"
        :key="`polygon${index}`"
        :class="selectedPolygon === polygon ? 'editor__list-item--selected' : undefined"
      >
        <input v-model="polygon.id" type="number" min="1" max="255" aria-label="Area ID">
        <input v-model="polygon.name" type="text" aria-label="Area name">
      </li>
    </ul>
  </div>
</template>

<script>
import { Mesh, OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial, WebGLRenderer } from 'three'
import textFragmentShader from '@/components/editor/editorTextFragmentShader'
import TextureManager from '@/components/TextureManager'

export default {
  name: 'Editor',
  data () {
    return {
      polygons: window.localStorage.editorPolygons !== undefined ? JSON.parse(window.localStorage.editorPolygons) : [],
      newPolygon: null,
      selectedPolygon: null,
      draggedPoint: null,
      zoom: 1,
      offset: { x: 0, y: 0 },
      panning: 0,
      panStart: null
    }
  },
  watch: {
    polygons: {
      handler (value) {
        window.localStorage.editorPolygons = JSON.stringify(value)
      },
      deep: true
    },
    zoom (value) {
      this.camera.zoom = value
      this.camera.updateProjectionMatrix()
    },
    offset: {
      handler ({ x, y }) {
        this.camera.position.set(x * (1024 / this.$refs.surface.clientWidth), y * (512 / this.$refs.surface.clientHeight), 0)
        this.camera.updateProjectionMatrix()
      },
      deep: true
    }
  },
  mounted () {
    this.renderer = new WebGLRenderer({ antialias: false, alpha: true })
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.setSize(window.innerWidth, window.innerHeight)
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

      this.textPlane = new Mesh(geo, textMaterial)
      this.textPlane.position.z = 0
      this.textPlane.frustumCulled = false

      this.scene = new Scene()
      this.scene.add(this.textPlane)
    },
    update () {
      this.resizeCanvasToDisplaySize()

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
        this.camera.updateProjectionMatrix()
        // update any render target sizes here
      }
    },
    edit (event) {
      if (this.draggedPoint !== null || event.altKey || this.panning || event.button === 1) {
        return
      }

      const { clientX, clientY, shiftKey } = event
      const { x, y } = this.transform(clientX, clientY)
      if (this.newPolygon !== null) {
        this.newPolygon.points.push({ x, y })

        if (shiftKey) {
          this.newPolygon = null
        }
      } else if (this.selectedPolygon !== null && shiftKey) {
        this.selectedPolygon.points.push({ x, y })
      } else if (this.selectedPolygon !== null) {
        this.selectedPolygon = null
      } else {
        this.newPolygon = { name: 'New Area', id: 1, points: [{ x, y }] }
        this.polygons.push(this.newPolygon)
      }
    },
    clickPolygon (event, polygon, index) {
      if (this.draggedPoint !== null) {
        return
      }

      if (event.ctrlKey) {
        this.polygons.splice(index, 1)

        if (polygon === this.selectedPolygon) {
          this.selectedPolygon = null
        }

        if (polygon === this.newPolygon) {
          this.newPolygon = null
        }
      }

      if (this.newPolygon !== null) {
        return
      }

      if (!event.ctrlKey) {
        this.selectedPolygon = polygon
      }

      event.preventDefault()
      event.stopPropagation()
    },
    clickPoint (event, polygon, polygonIndex, pointIndex) {
      if (this.draggedPoint !== null) {
        return
      }

      if (!event.ctrlKey && polygon === this.newPolygon && pointIndex === 0) {
        this.newPolygon = null
      } else if (event.ctrlKey) {
        polygon.points.splice(pointIndex, 1)

        if (polygon.points.length === 0) {
          this.polygons.splice(polygonIndex, 1)

          if (this.newPolygon === polygon) {
            this.newPolygon = null
          }

          if (this.selectedPolygon === polygon) {
            this.selectedPolygon = null
          }
        }
      }

      event.preventDefault()
      event.stopPropagation()
    },
    startDrag (event, point) {
      if (this.newPolygon !== null || event.altKey || event.button === 1) {
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
      return polygon.points.map(p => `${p.x},${p.y}`).join(' ')
    },
    onZoom (event) {
      const e = window.event || event
      const delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail))
      this.zoom = Math.max(1, this.zoom + delta)
    },
    transform (x, y) {
      return {
        x: (this.$refs.surface.clientWidth / 2 + (x - this.$refs.surface.clientWidth / 2) / this.zoom) + this.offset.x,
        y: (this.$refs.surface.clientHeight / 2 + (y - this.$refs.surface.clientHeight / 2) / this.zoom) - this.offset.y
      }
    },
    sortPolygonsById () {
      this.polygons.sort((a, b) => a.id - b.id)
    },
    async renderPng (polygons, width, height, overlay) {
      const xScale = (width / this.$refs.surface.clientWidth)
      const yScale = (height / this.$refs.surface.clientHeight)
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

      const baseData = overlay ? (await this.textureManager.loadData('hq_map_text', false, 'rgba')).data : undefined

      img.onload = function () {
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0)
        const hoverData = ctx.getImageData(0, 0, width, height).data

        if (overlay) {
          for (let i = 0; i < hoverData.length / 4; i++) {
            baseData[i * 4 + 2] = hoverData[i * 4 + 2]
          }
        }

        if (overlay) {
          ctx.clearRect(0, 0, width, height)
          ctx.putImageData(new ImageData(baseData, width, height), 0, 0)
        }

        const png = canvas.toDataURL('image/png')
        const a = document.createElement('a')
        document.body.appendChild(a)
        a.style = 'display: none'
        a.href = png
        a.download = `${overlay ? 'overlay' : 'hover'}.png`
        a.click()
        window.URL.revokeObjectURL(png)
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

  &__list {
    list-style-type: none;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    width: 350px;
    background: #ccc;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    z-index: 10;

    li {
      display: grid;
      grid-template-columns: auto 1fr;
      grid-gap: 0.5rem;
      padding: 0.5rem;

      &:first-child {
        grid-template-columns: auto auto auto;
      }
    }

    &-item--selected {
      background: red;
    }
  }

  canvas.editor__reference {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1024px !important;
    height: 512px !important;
  }
}
</style>
