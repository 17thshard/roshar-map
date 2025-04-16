<template>
  <div :class="['editor', { 'editor--loading': loading }]">
    <div class="editor__menu">
      <img src="@/assets/logos/roshar.png" alt="Logo">
      <button @click="save">
        Save to disk
      </button>
      Mode:
      <label for="editor__mode--locations">
        <input id="editor__mode--locations" v-model="mode" type="radio" value="locations">
        Locations
      </label>
      <label for="editor__mode--events">
        <input id="editor__mode--events" v-model="mode" type="radio" value="events">
        Events
      </label>
      <label for="editor__mode--characters">
        <input id="editor__mode--characters" v-model="mode" type="radio" value="characters">
        Characters
      </label>
      <label for="editor__mode--misc">
        <input id="editor__mode--misc" v-model="mode" type="radio" value="misc">
        Misc
      </label>
      <label for="editor__mode--tags">
        <input id="editor__mode--tags" v-model="mode" type="radio" value="tags">
        Tags
      </label>

      <div class="editor__file">
        <label for="editor__selected-language">Edited Language</label>
        <select id="editor__selected-language" v-model="selectedLanguage">
          <option :value="null">
            None
          </option>
          <option v-for="language in availableLanguages" :key="language" :value="language">
            {{ language }}
          </option>
        </select>

        <label for="editor__selected-language">Override with</label>
        <input id="editor__file--language" :disabled="selectedLanguage === null" type="file" @change="loadLanguage">
      </div>
      <label for="editor__texture-locale">Texture Locale</label>
      <select id="editor__texture-locale" v-model="textureLocale" @change="resetRenderer">
        <option v-for="language in ['en', 'es', 'ru', 'tr', 'zh']" :key="language" :value="language">
          {{ language }}
        </option>
      </select>
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
          v-for="(location, index) in locations.filter(l => l.points[textureLocale] !== undefined && (selectedLocation !== null && selectedLocation.shadesmar ? l.shadesmar : l.shadesmar !== true))"
        >
          <polygon
            :key="`polygon${index}`"
            :points="buildPolygonPoints(location)"
            :class="selectedLocation === location ? 'editor__surface-polygon--selected' : undefined"
            @click="clickLocationPolygon(location, $event)"
          />
          <circle
            v-for="(point, pointIndex) in location.points[textureLocale]"
            :key="`polygon${index}-point${pointIndex}`"
            :cx="point.x / xScale"
            :cy="point.y / yScale"
            :r="5 / zoom"
            @click="clickPoint($event, location, index, pointIndex)"
            @mousedown="startDrag($event, point)"
          />
        </template>
      </svg>
      <div
        v-if="mode === 'events' && selectedEvent !== null"
        class="editor__dot"
        :style="{ left: `${selectedEvent.coordinates.x / xScale}px`, top: `${selectedEvent.coordinates.y / yScale}px` }"
      />
      <div
        v-if="mode === 'locations' && selectedLocation !== null"
        class="editor__dot"
        :style="{ left: `${selectedLocation.coordinates.x / xScale}px`, top: `${selectedLocation.coordinates.y / yScale}px` }"
      />
      <div
        v-if="mode === 'events' && selectedEvent === null && markerPosition !== null"
        class="editor__marker"
        :style="{ left: `${markerPosition.x / xScale}px`, top: `${markerPosition.y / yScale}px` }"
      >
        {{ `(${markerPosition.x}, ${markerPosition.y})` }}
      </div>
    </div>
    <canvas ref="referenceCanvas" class="editor__reference" width="1024" height="512" />
    <ul v-if="mode === 'locations'" class="editor__location-list" @click.self="selectedLocation = null">
      <li>
        <label for="editor__file--locations">
          Override with
        </label>
        <input id="editor__file--locations" type="file" @change="loadLocations">
        <button @click="saveLocations">
          Save
        </button>
        <button @click="sortLocationsByMapId">
          Sort by Map ID
        </button>
        <div class="editor__location-list-actions">
          <button @click="addLocation">
            New
          </button>
          <button @click="selectedEvent = null">
            Clear selection
          </button>
          <button @click="renderPhysical(undefined)">
            Save Physical Realm
          </button>
          <button @click="renderShadesmar(undefined)">
            Save Shadesmar
          </button>
          <button @click="renderHover(undefined)">
            Save hover
          </button>
          <button @click="renderAll">
            Save all
          </button>
        </div>
      </li>
      <li
        v-for="(location, index) in locations"
        :key="`location${index}`"
        :class="selectedLocation === location ? 'editor__location-list-item--selected' : undefined"
        @click="selectLocation(location)"
      >
        <span>{{ location.mapId }}</span>
        <span>{{ location.id }}</span>
        <button :disabled="isLinked('locations', location.id)" @click.stop="deleteLocation(index)">
          Delete
        </button>
      </li>
    </ul>
    <ul v-else-if="mode === 'events'" class="editor__event-list" @click.self="selectedEvent = null">
      <li>
        <label for="editor__file--events">
          Override with
        </label>

        <input id="editor__file--events" type="file" @change="loadEvents">
        <button @click="saveEvents">
          Save
        </button>
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
        @click="selectEvent(event)"
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
        <button :disabled="isLinked('events', event.id)" @click.stop="deleteEvent(index)">
          Delete
        </button>
      </li>
    </ul>
    <ul v-else-if="mode === 'characters'" class="editor__character-list" @click.self="selectedCharacter = null">
      <li>
        <label for="editor__file--characters">
          Override with
        </label>

        <input id="editor__file--characters" type="file" @change="loadCharacters">
        <button @click="saveCharacters">
          Save
        </button>
        <button @click="addCharacter">
          New
        </button>
        <button @click="selectedCharacter = null">
          Clear selection
        </button>
      </li>
      <li
        v-for="(character, index) in characters"
        :key="`character${index}`"
        :class="selectedCharacter === character ? 'editor__character-list-item--selected' : undefined"
        @click="selectCharacter(character)"
      >
        <span>{{ character.id }}</span>
        <button :disabled="isLinked('characters', character.id)" @click.stop="deleteCharacter(index)">
          Delete
        </button>
      </li>
    </ul>
    <ul v-else-if="mode === 'misc'" class="editor__misc-list" @click.self="selectedMisc = null">
      <li>
        <label for="editor__file--misc">
          Override with
        </label>

        <input id="editor__file--misc" type="file" @change="loadMisc">
        <button @click="saveMisc">
          Save
        </button>
        <button @click="addMisc">
          New
        </button>
        <button @click="selectedMisc = null">
          Clear selection
        </button>
      </li>
      <li
        v-for="(miscEntry, index) in misc"
        :key="`misc${index}`"
        :class="selectedMisc === miscEntry ? 'editor__misc-list-item--selected' : undefined"
        @click="selectMisc(miscEntry)"
      >
        <span>{{ miscEntry.id }}</span>
        <button :disabled="isLinked('misc', miscEntry.id)" @click.stop="deleteMisc(index)">
          Delete
        </button>
      </li>
    </ul>
    <div v-else-if="mode === 'tags'" class="editor__tags" @click.self="selectedTag = null">
      <div class="editor__tags-actions">
        <label for="editor__file--tags">
          Override with
        </label>

        <input id="editor__file--tags" type="file" @change="loadTags">
      </div>
      <template v-if="uncategorizedTags.length > 0">
        <h3>Uncategorized</h3>
        <Draggable tag="ul" :value="uncategorizedTags" group="tags" class="editor__tags-list">
          <li
            v-for="tag in uncategorizedTags"
            :key="tag.id"
            class="editor__tags-list-item--invalid"
          >
            {{ tag.id }}
          </li>
        </Draggable>
      </template>
      <Draggable tag="ul" :list="tagCategories" group="tag-categories" class="editor__tags-categories">
        <li>
          <button @click="addTagCategory">
            New Category
          </button>
          <button @click="selectedTag = null">
            Clear selection
          </button>
        </li>
        <li
          v-for="tagCategory in tagCategories"
          :key="tagCategory.id"
          :class="selectedTag === tagCategory && categorySelected ? 'editor__tags-item--selected' : undefined"
          @click.self="selectTag(tagCategory, true)"
        >
          <span>{{ tagCategory.id }}</span>
          <button @click.stop="deleteTagCategory(tagCategory)">
            Delete
          </button>
          <Draggable tag="ul" :list="tagCategory.tags" group="tags" class="editor__tags-list">
            <li
              v-for="tag in tagCategory.tags"
              :key="tag.id"
              :class="{
                'editor__tags-item--selected': selectedTag === tag && !categorySelected
              }"
              @click.stop="selectTag(tag, false)"
            >
              {{ tag.id }}
            </li>
          </Draggable>
        </li>
      </Draggable>
    </div>
    <template
      v-if="mode === 'events' && selectedEvent !== null"
    >
      <EventProperties
        :key="selectedEventKey"
        :event="selectedEvent"
        :available-tags="availableTags"
        :linked="relatedIndex[`events/${selectedEvent.id}`]"
        :linkables="linkables"
      />
      <EventPreview
        :key="`preview${selectedEventKey}`"
        :event="selectedEvent"
        :selected-language="selectedLanguage"
        :languages="loadedLanguages"
      />
    </template>

    <LocationProperties
      v-if="mode === 'locations' && selectedLocation !== null"
      :key="selectedLocationKey"
      :location="selectedLocation"
      :linked="relatedIndex[`locations/${selectedLocation.id}`]"
      :linkables="linkables"
    />

    <CharacterProperties
      v-if="mode === 'characters' && selectedCharacter !== null"
      :key="selectedCharacterKey"
      :character="selectedCharacter"
      :linked="relatedIndex[`characters/${selectedCharacter.id}`]"
      :linkables="linkables"
    />

    <MiscProperties
      v-if="mode === 'misc' && selectedMisc !== null"
      :key="selectedMiscKey"
      :misc="selectedMisc"
      :linked="relatedIndex[`misc/${selectedMisc.id}`]"
      :linkables="linkables"
    />

    <TagProperties
      v-if="mode === 'tags' && selectedTag !== null"
      :key="selectedTagKey"
      :tag="selectedTag"
      :category="categorySelected"
      :tag-categories="tagCategories"
      :selected-language="selectedLanguage"
      :languages="loadedLanguages"
    />
  </div>
</template>

<script>
import { Mesh, OrthographicCamera, PlaneBufferGeometry, Scene, ShaderMaterial, Vector2, WebGLRenderer } from 'three'
import Draggable from 'vuedraggable'
import DeepDiff from 'deep-diff'
import Zip from 'jszip'
import mapFragmentShader from '@/components/map/mapFragmentShader'
import textFragmentShader from '@/components/editor/editorTextFragmentShader'
import TextureManager from '@/components/map/TextureManager'
import EventProperties from '@/components/editor/EventProperties.vue'
import EventPreview from '@/components/editor/EventPreview.vue'
import originalLocations from '@/store/locations.json'
import originalEvents from '@/store/events.json'
import originalCharacters from '@/store/characters.json'
import originalMisc from '@/store/misc.json'
import originalTagCategories from '@/store/tags.json'
import LocationProperties from '@/components/editor/LocationProperties.vue'
import CharacterProperties from '@/components/editor/CharacterProperties.vue'
import MiscProperties from '@/components/editor/MiscProperties.vue'
import TagProperties from '@/components/editor/TagProperties.vue'
import languageMenu from '@/lang/menu.json'

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
  components: { TagProperties, LocationProperties, EventPreview, EventProperties, CharacterProperties, MiscProperties, Draggable },
  data () {
    return {
      textureLocale: 'en',
      loading: true,
      mode: 'events',
      locations: JSON.parse(JSON.stringify(originalLocations)),
      events: JSON.parse(JSON.stringify(originalEvents)),
      characters: JSON.parse(JSON.stringify(originalCharacters)),
      misc: JSON.parse(JSON.stringify(originalMisc)),
      selectedLocation: null,
      selectedLocationKey: null,
      selectedEvent: null,
      selectedEventKey: null,
      selectedCharacter: null,
      selectedCharacterKey: null,
      selectedMisc: null,
      selectedMiscKey: null,
      selectedTag: null,
      selectedTagKey: null,
      categorySelected: false,
      draggedPoint: null,
      zoom: 1,
      offset: { x: 0, y: 0 },
      panning: 0,
      panStart: null,
      xScale: 1,
      yScale: 1,
      availableLanguages: languageMenu.map(l => l.code),
      loadedLanguages: {},
      selectedLanguage: null,
      locationsDirty: false,
      eventsDirty: false,
      charactersDirty: false,
      miscDirty: false,
      languagesDirty: false,
      tagsDirty: false,
      languagesLoaded: false,
      tagCategories: JSON.parse(JSON.stringify(originalTagCategories)),
      markerPosition: null
    }
  },
  computed: {
    dirty () {
      return this.locationsDirty || this.eventsDirty || this.charactersDirty || this.miscDirty || this.languagesDirty || this.tagsDirty
    },
    availableTags () {
      const set = new Set()
      this.events.forEach((event) => {
        (event.tags ?? []).forEach(t => set.add(t))
      })

      return [...set]
    },
    uncategorizedTags () {
      return this.availableTags.filter(tag => this.tagCategories.every(c => !c.tags.some(t => t.id === tag)))
        .map(tag => ({ id: tag, color: '#999791', alpha: 0.5 }))
    },
    linkables () {
      return [
        ...this.locations.map(l => `locations/${l.id}`),
        ...this.events.map(e => `events/${e.id}`),
        ...this.characters.map(c => `characters/${c.id}`),
        ...this.misc.map(m => `misc/${m.id}`)
      ]
    },
    relatedIndex () {
      const result = {}

      function buildIndex (type, items) {
        items.forEach((item) => {
          (item.related ?? []).forEach((relatedItem) => {
            if (result[relatedItem] === undefined) {
              result[relatedItem] = []
            }

            result[relatedItem].push(`${type}/${item.id}`)
          })
        })
      }

      buildIndex('locations', this.locations)
      buildIndex('events', this.events)
      buildIndex('characters', this.characters)
      buildIndex('misc', this.misc)

      return result
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
    },
    loadedLanguages: {
      handler () {
        if (!this.languagesLoaded) {
          return
        }

        this.languagesDirty = true
      },
      deep: true
    },
    locations: {
      handler (value) {
        this.locationsDirty = DeepDiff(originalLocations, value) !== undefined
      },
      deep: true
    },
    events: {
      handler (value) {
        this.eventsDirty = DeepDiff(originalEvents, value) !== undefined
      },
      deep: true
    },
    characters: {
      handler (value) {
        this.charactersDirty = DeepDiff(originalCharacters, value) !== undefined
      },
      deep: true
    },
    misc: {
      handler (value) {
        this.miscDirty = DeepDiff(originalMisc, value) !== undefined
      },
      deep: true
    },
    tagCategories: {
      handler (value) {
        this.tagsDirty = DeepDiff(originalTagCategories, value) !== undefined
      },
      deep: true
    },
    dirty: {
      handler (isDirty) {
        if (isDirty && !document.title.startsWith('(*)')) {
          document.title = `(*) ${document.title}`
        } else if (!isDirty && document.title.startsWith('(*)')) {
          document.title = document.title.substring(4)
        }
      },
      immediate: true
    }
  },
  created () {
    Promise.all(this.availableLanguages.map(lang =>
      import(/* webpackChunkName: "lang-[request]" */ '@/lang/' + lang + '.lang.json').then((messages) => {
        this.$set(this.loadedLanguages, lang, messages.default)
      }))).then(() => {
      this.languagesLoaded = true
    })
  },
  mounted () {
    window.addEventListener('beforeunload', this.onLeave)

    this.setupRenderer()
  },
  destroyed () {
    window.removeEventListener('beforeunload', this.onLeave)
    this.renderer.dispose()
    cancelAnimationFrame(this.latestAnimationFrame)
  },
  methods: {
    resetRenderer () {
      this.renderer.dispose()
      this.renderer.domElement.remove()
      cancelAnimationFrame(this.latestAnimationFrame)

      this.setupRenderer()
    },
    setupRenderer () {
      this.loading = true

      this.renderer = new WebGLRenderer({ antialias: false, alpha: true })
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.renderer.setClearColor(0x000000)
      this.renderer.sortObjects = false

      this.textureManager = new TextureManager(this.renderer, this.textureLocale)

      this.loadTextures()
        .then(this.setupScene)
        .then(() => {
          this.$el.appendChild(this.renderer.domElement)

          this.update()
          this.loading = false
        })
    },
    onLeave (event) {
      if (this.dirty) {
        event.returnValue = 'Are you sure you want to leave?'
      }
    },
    loadTextures () {
      const textures = {
        map_bg: { hqAvailable: true, lossy: true },
        map: { hqAvailable: true },
        shadesmar_map_bg: { lossy: true },
        map_text: { hqAvailable: true, localized: true },
        shadesmar_map_text: { hqAvailable: true, localized: true }
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
        fragmentShader: mapFragmentShader
          .replace('#define CITY_DOTS_COUNT 0', '#define CITY_DOTS_COUNT 1')
          .replace('#define SHADESMAR_CITY_DOTS_COUNT 0', '#define SHADESMAR_CITY_DOTS_COUNT 1'),
        uniforms: {
          BgTexture: { value: textures.map_bg },
          OutlineTexture: { value: textures.map },
          ShadesmarBgTexture: { value: textures.shadesmar_map_bg },
          TransitionTexture: { value: textures.transition },
          Transition: { value: 0 },
          PerpTransition: { value: 0 },
          PerpLocation: { value: new Vector2() },
          PerpPeriod: { value: 3.05355 },
          Time: { value: 0 },
          CityDots: { value: [new Vector2(-1000, -1000)] },
          ShadesmarCityDots: { value: [new Vector2(-1000, -1000)] }
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

            gl_Position = projectionMatrix * modelViewMatrix * vec4(position * vec3(512, 256, 0), 1.0);
          }
        `,
        fragmentShader: textFragmentShader,
        uniforms: {
          Texture: { value: textures.map_text },
          ShadesmarTexture: { value: textures.shadesmar_map_text },
          Shadesmar: { value: false }
        },
        extensions: {
          derivatives: true
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

      if (this.selectedEvent !== null && this.mode === 'events') {
        this.mapPlane.material.uniforms.Transition.value = this.selectedEvent.shadesmar ? 1 : 0
        this.textPlane.material.uniforms.Shadesmar.value = this.selectedEvent.shadesmar
        this.mapPlane.material.uniforms.PerpTransition.value = this.selectedEvent.perpendicularity ? 1 : 0
        this.mapPlane.material.uniforms.PerpLocation.value.set(
          this.selectedEvent.coordinates.x - 512,
          256 - this.selectedEvent.coordinates.y
        )
      } else if (this.selectedLocation !== null && this.mode === 'locations') {
        this.mapPlane.material.uniforms.Transition.value = this.selectedLocation.shadesmar ? 1 : 0
        this.textPlane.material.uniforms.Shadesmar.value = this.selectedLocation.shadesmar
      } else {
        this.mapPlane.material.uniforms.Transition.value = 0
        this.textPlane.material.uniforms.Shadesmar.value = false
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
    save () {
      const zip = new Zip()
      const srcDir = zip.folder('src')

      const storeDir = srcDir.folder('store')
      storeDir.file('locations.json', JSON.stringify(this.locations, undefined, 4))
      storeDir.file('events.json', JSON.stringify(this.events, undefined, 4))
      storeDir.file('characters.json', JSON.stringify(this.characters, undefined, 4))
      storeDir.file('misc.json', JSON.stringify(this.misc, undefined, 4))
      storeDir.file('tags.json', JSON.stringify(this.tagCategories, undefined, 4))

      const langDir = srcDir.folder('lang')
      Object.keys(this.loadedLanguages).forEach((lang) => {
        langDir.file(`${lang}.json`, JSON.stringify(this.loadedLanguages[lang], undefined, 4))
      })

      zip.generateAsync({ type: 'uint8array' }).then((data) => {
        saveAs(
          new Blob([data], { type: 'application/zip' }),
          'data.zip'
        )
        this.locationsDirty = false
        this.eventsDirty = false
        this.charactersDirty = false
        this.miscDirty = false
        this.languagesDirty = false
        this.tagsDirty = false
      })
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

      event.target.value = ''
    },
    saveLocations () {
      saveAs(new Blob([JSON.stringify(this.locations, undefined, 4)], { type: 'application/json' }), 'locations.json')
      this.locationsDirty = false
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

      event.target.value = ''
    },
    saveEvents () {
      saveAs(new Blob([JSON.stringify(this.events, undefined, 4)], { type: 'application/json' }), 'events.json')
      this.eventsDirty = false
    },
    loadCharacters (event) {
      if (event.target.files.length === 0) {
        return
      }

      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.characters = JSON.parse(fileReader.result)
        this.selectedEvent = null
        this.mode = 'characters'
      }
      fileReader.readAsText(event.target.files[0])

      event.target.value = ''
    },
    saveCharacters () {
      saveAs(new Blob([JSON.stringify(this.characters, undefined, 4)], { type: 'application/json' }), 'characters.json')
      this.charactersDirty = false
    },
    loadMisc (event) {
      if (event.target.files.length === 0) {
        return
      }

      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.misc = JSON.parse(fileReader.result)
        this.selectedEvent = null
        this.mode = 'misc'
      }
      fileReader.readAsText(event.target.files[0])

      event.target.value = ''
    },
    saveMisc () {
      saveAs(new Blob([JSON.stringify(this.misc, undefined, 4)], { type: 'application/json' }), 'misc.json')
      this.miscDirty = false
    },
    loadLanguage (event) {
      if (event.target.files.length === 0) {
        return
      }

      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.loadedLanguages[this.selectedLanguage] = JSON.parse(fileReader.result)
      }
      fileReader.readAsText(event.target.files[0])

      event.target.value = ''
    },
    loadTags (event) {
      if (event.target.files.length === 0) {
        return
      }

      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.tagCategories = JSON.parse(fileReader.result)
        this.selectedTag = null
      }
      fileReader.readAsText(event.target.files[0])

      event.target.value = ''
    },
    addEvent () {
      this.selectedEvent = { id: 'new-event', date: [1170], tags: [], coordinates: { x: 0, y: 0 } }
      this.events.push(this.selectedEvent)
    },
    deleteEvent (index) {
      this.selectedEvent = null
      this.events.splice(index, 1)
    },
    addLocation () {
      this.selectedLocation = { id: 'new-location', coordinates: { x: 0, y: 0 }, points: {} }
      this.locations.push(this.selectedLocation)
    },
    deleteLocation (index) {
      this.selectedLocation = null
      this.locations.splice(index, 1)
    },
    selectEvent (event) {
      this.selectedEventKey = Date.now()
      this.selectedEvent = event
    },
    addCharacter () {
      this.selectedCharacter = { id: 'new-character', related: [] }
      this.characters.push(this.selectedCharacter)
    },
    deleteCharacter (index) {
      this.selectedCharacter = null
      this.characters.splice(index, 1)
    },
    selectCharacter (character) {
      this.selectedCharacterKey = Date.now()
      this.selectedCharacter = character
    },
    addMisc () {
      this.selectedMisc = { id: 'new-misc', related: [] }
      this.misc.push(this.selectedMisc)
    },
    deleteMisc (index) {
      this.selectedMisc = null
      this.misc.splice(index, 1)
    },
    selectMisc (misc) {
      this.selectedMiscKey = Date.now()
      this.selectedMisc = misc
    },
    addTagCategory () {
      const name = window.prompt('New category name')

      if (name !== null && this.tagCategories[name] === undefined) {
        this.$set(this.tagCategories, name, [])
      }
    },
    selectTag (tag, category) {
      this.selectedTagKey = Date.now()
      this.selectedTag = tag
      this.categorySelected = category
    },
    deleteTagCategory (category) {
      this.$delete(this.tagCategories, category)
    },
    click (event) {
      if (this.draggedPoint !== null || event.altKey || this.panning || event.button === 1) {
        return
      }

      const { clientX, clientY, shiftKey, ctrlKey } = event
      const { x, y } = this.transform(clientX, clientY)

      if (this.mode === 'events') {
        if (this.selectedEvent !== null) {
          this.selectedEvent.coordinates = { x: Number.parseFloat(x.toFixed(1)), y: Number.parseFloat(y.toFixed(1)) }
        } else {
          this.markerPosition = { x: Number.parseFloat(x.toFixed(1)), y: Number.parseFloat(y.toFixed(1)) }
        }

        return
      }

      if (this.selectedLocation !== null && this.selectedLocation.mapId !== undefined && shiftKey) {
        this.ensureLocalePoints(this.selectedLocation)
        this.selectedLocation.points[this.textureLocale].push({ x, y })
      } else if (this.selectedLocation !== null && ctrlKey) {
        this.selectedLocation.coordinates = { x: Number.parseFloat(x.toFixed(1)), y: Number.parseFloat(y.toFixed(1)) }
      }
    },
    clickLocationPolygon (location, event) {
      if (event.ctrlKey) {
        return
      }

      this.selectedLocation = location
      event.stopPropagation()
    },
    selectLocation (location) {
      this.selectedLocationKey = Date.now()
      this.selectedLocation = location
    },
    clickPoint (event, location, locationIndex, pointIndex) {
      if (this.draggedPoint !== null) {
        return
      }

      if (event.ctrlKey && location.points[this.textureLocale] !== undefined) {
        location.points[this.textureLocale].splice(pointIndex, 1)
      }

      event.preventDefault()
      event.stopPropagation()
    },
    startDrag (event, point) {
      if (event.altKey || event.button === 1) {
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
    ensureLocalePoints (location) {
      if (location.points[this.textureLocale] === undefined) {
        this.$set(location.points, this.textureLocale, [])
      }
    },
    buildPolygonPoints (polygon) {
      return polygon.points[this.textureLocale].map(p => `${p.x / this.xScale},${p.y / this.yScale}`).join(' ')
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
    sortLocationsByMapId () {
      this.locations.sort((a, b) => {
        if (a.mapId === undefined && b.mapId === undefined) {
          return 0
        }

        if (a.mapId === undefined && b.mapId !== undefined) {
          return 1
        }

        if (a.mapId !== undefined && b.mapId === undefined) {
          return -1
        }

        return a.mapId - b.mapId
      })
    },
    async renderAll () {
      this.loading = true
      const zip = new Zip()
      const texturesDir = zip.folder(`src/assets/textures/localized/${this.textureLocale}`)

      const fileAction = (fileName, png) => {
        texturesDir.file(fileName, png.substring(png.indexOf('base64,') + 'base64,'.length), { base64: true })
      }

      await this.renderPhysical(fileAction)
      await this.renderShadesmar(fileAction)
      await this.renderHover(fileAction)

      const data = await zip.generateAsync({ type: 'uint8array' })

      saveAs(
        new Blob([data], { type: 'application/zip' }),
        `${this.textureLocale}_textures.zip`
      )
      this.loading = false
    },
    async renderPhysical (fileAction) {
      await this.renderPng(this.locations.filter(l => l.shadesmar !== true), 'map_text', fileAction)
      await this.renderPng(this.locations.filter(l => l.shadesmar !== true), 'hq_map_text', fileAction)
    },
    async renderShadesmar (fileAction) {
      await this.renderPng(this.locations.filter(l => l.shadesmar === true), 'shadesmar_map_text', fileAction)
      await this.renderPng(this.locations.filter(l => l.shadesmar === true), 'hq_shadesmar_map_text', fileAction)
    },
    async renderHover (fileAction) {
      await this.renderPng(this.locations, undefined, fileAction)
    },
    async renderPng (locations, base, fileAction) {
      const { width, height, data: baseData } = base !== undefined
        ? (await this.textureManager.loadData(base, false, true, false, 'rgba'))
        : { width: 1024, height: 512 }

      const xScale = width / 1024
      const yScale = height / 512
      const svgString = `
      <svg xmlns='http://www.w3.org/2000/svg' shape-rendering="crispEdges" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${
        locations.filter(l => l.points !== undefined && l.points[this.textureLocale] !== undefined).map((location) => {
          let hexId = Number.parseInt(location.mapId, 10).toString(16)

          if (location.shadesmar && base === undefined) {
            hexId = `${hexId}00`
          }

          return `<polygon fill="#${hexId.padStart(6, '0')}" style="mix-blend-mode: screen" points="${
            location.points[this.textureLocale].map(p => `${(p.x * xScale).toFixed(5)},${(p.y * yScale).toFixed(5)}`).join(' ')
          }"></polygon>`
        }).join('\n')
      }
      </svg>
      `

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      return new Promise((resolve) => {
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

          const fileName = `${base !== undefined ? base : 'hover_text'}.png`
          const png = canvas.toDataURL('image/png')

          if (fileAction !== undefined) {
            fileAction(fileName, png)
          } else {
            const a = document.createElement('a')
            document.body.appendChild(a)
            a.style = 'display: none'
            a.href = png
            a.download = fileName
            a.click()
            a.remove()
          }

          window.URL.revokeObjectURL(png)
          canvas.remove()

          resolve()
        }
        img.src = `data:image/svg+xml;base64,${window.btoa(svgString)}`
      })
    },
    hasTagCategory (tag) {
      return this.tagCategories.some(({ tags }) => tags.includes(tag))
    },
    isLinked (type, id) {
      return this.relatedIndex[`${type}/${id}`] !== undefined && this.relatedIndex[`${type}/${id}`].length > 0
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

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

  &--loading {
    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      cursor: wait;
      z-index: 1000;
    }
  }

  input[type=file] {
    pointer-events: auto;
  }

  &__menu {
    position: fixed;
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

    button:first-of-type {
      margin-right: 1rem;
    }

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

    label, select, input, button {
      margin-right: 0.5rem;
    }

    input {
      width: 150px;
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
    position: fixed;
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
      padding: 0.5rem 1rem;
      cursor: pointer;

      &:first-child {
        grid-template-columns: auto auto;
        padding-top: 0;

        & > button:first-of-type, & > button:nth-of-type(2), input, label {
          grid-column: 1 / span 2;
        }
      }
    }

    &-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: 0.5rem;
      grid-column: 1 / span 2;
    }

    &-item--selected {
      color: #fafafa;
      background: #0f3562;
    }
  }

  &__event-list {
    list-style-type: none;
    position: fixed;
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
        grid-template-columns: 1fr 1fr;
        padding-top: 0;

        button {
          pointer-events: auto;
        }

        button:first-of-type, button:nth-of-type(2), label, input {
          grid-column: 1 / span 2;
        }
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
        text-align: end;
      }

      &-rest {
        text-align: start;
      }
    }
  }

  &__character-list {
    list-style-type: none;
    position: fixed;
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
      grid-template-columns: minmax(0, 1fr) auto;
      grid-gap: 0.5rem;
      padding: 0.5rem 1rem;
      cursor: pointer;

      &:first-child {
        cursor: default;
        pointer-events: none;
        grid-template-columns: 1fr 1fr;
        padding-top: 0;

        button {
          pointer-events: auto;
        }

        button:first-of-type, label, input {
          grid-column: 1 / span 2;
        }
      }
    }

    &-item--selected {
      color: #fafafa;
      background: #0f3562;
    }
  }

  &__misc-list {
    list-style-type: none;
    position: fixed;
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
      grid-template-columns: minmax(0, 1fr) auto;
      grid-gap: 0.5rem;
      padding: 0.5rem 1rem;
      cursor: pointer;

      &:first-child {
        cursor: default;
        pointer-events: none;
        grid-template-columns: 1fr 1fr;
        padding-top: 0;

        button {
          pointer-events: auto;
        }

        button:first-of-type, label, input {
          grid-column: 1 / span 2;
        }
      }
    }

    &-item--selected {
      color: #fafafa;
      background: #0f3562;
    }
  }

  &__tags {
    position: fixed;
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

    h3 {
      margin: 0;
      padding: 0 1rem;
    }

    &-actions {
      display: grid;
      grid-template-columns: 1fr;
      grid-gap: 0.5rem;
      padding: 0 1rem;
      margin-bottom: 0.5rem;
    }

    &-categories {
      list-style-type: none;
      padding: 0;
      margin: 0 0 1rem;

      li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-gap: 0.5rem;
        padding: 0.5rem 1rem;
        cursor: pointer;

        & > &:first-child {
          cursor: default;
          pointer-events: none;
          grid-template-columns: 1fr 1fr;

          button {
            pointer-events: auto;
          }
        }

        & > span {
          pointer-events: none;
        }
      }
    }

    &-list {
      list-style-type: none;
      padding: 0;
      margin: 0 0 0.5rem;
      grid-column: 1/span 2;

      li {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        grid-gap: 0.5rem;
        padding: 0.5rem 1rem;
        cursor: pointer;
      }

      &-item--invalid {
        color: red;
      }
    }

    &-item--selected {
      color: #fafafa;
      background: #0f3562;
    }
  }

  &__dot {
    position: absolute;
    width: 0.75rem;
    height: 0.75rem;
    margin-left: -0.375rem;
    margin-top: -0.375rem;
    background: red;
    box-sizing: border-box;
    border-radius: 100%;
  }

  &__marker {
    position: absolute;
    pointer-events: none;
    color: white;
    text-shadow: rgb(0, 0, 0) 2px 0 0, rgb(0, 0, 0) 1.75517px 0.958851px 0, rgb(0, 0, 0) 1.0806px 1.68294px 0, rgb(0, 0, 0) 0.141474px 1.99499px 0, rgb(0, 0, 0) -0.832294px 1.81859px 0px, rgb(0, 0, 0) -1.60229px 1.19694px 0px, rgb(0, 0, 0) -1.97998px 0.28224px 0px, rgb(0, 0, 0) -1.87291px -0.701566px 0px, rgb(0, 0, 0) -1.30729px -1.5136px 0px, rgb(0, 0, 0) -0.421592px -1.95506px 0px, rgb(0, 0, 0) 0.567324px -1.91785px 0px, rgb(0, 0, 0) 1.41734px -1.41108px 0px, rgb(0, 0, 0) 1.92034px -0.558831px 0px;
    padding: 0.5rem;
    filter: drop-shadow(0 0 0.25rem rgba(0, 0, 0, 1.0));

    &:before, &:after {
      content: '';
      position: absolute;
      background: red;
    }

    &:before {
      left: -1rem;
      width: 2rem;
      height: 2px;
      top: 0;
      margin-top: -1px;
    }

    &:after {
      top: -1rem;
      margin-left: -1px;
      left: 0;
      height: 2rem;
      width: 2px;
    }
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

  .event-properties, .location-properties, .character-properties, .misc-properties, .tag-properties {
    position: fixed;
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
