<template>
  <section class="event-properties">
    <h2>Event properties</h2>
    <div class="event-properties__form">
      <label for="event-properties__date">Date</label>
      <input
        id="event-properties__date"
        v-model="dateText"
        type="text"
        :class="{ 'editor__input--invalid': dateText.match(/^-?\d+(\.\d+)*$/) === null }"
        @input="updateDate"
      >

      <label for="event-properties__tie-breaker">Tie Breaker</label>
      <input
        id="event-properties__tie-breaker"
        :value="event.tieBreaker"
        type="number"
        min="0"
        step="1"
        @input="updateTieBreaker"
      >

      <label for="event-properties__id">ID</label>
      <input id="event-properties__id" v-model="event.id" type="text">

      <template v-if="selectedLanguage !== null">
        <label for="event-properties__name">Name</label>
        <input
          id="event-properties__name"
          :value="displayName"
          type="text"
          @input="updateLangProperty('name', $event)"
        >

        <label for="event-properties__blurb">Blurb</label>
        <textarea
          id="event-properties__blurb"
          :value="displayBlurb"
          rows="7"
          @input="updateLangProperty('blurb', $event)"
        />
      </template>

      <div class="event-properties__coordinates">
        <h3>Coordinates</h3>

        <label for="event-properties__coordinates--x">X</label>
        <input
          id="event-properties__coordinates--x"
          v-model.number="event.coordinates.x"
          type="number"
          min="0"
          max="1024"
          step="any"
        >

        <label for="event-properties__coordinates--y">Y</label>
        <input
          id="event-properties__coordinates--y"
          v-model.number="event.coordinates.y"
          type="number"
          min="0"
          max="512"
          step="any"
        >
      </div>

      <div class="event-properties__checkboxes">
        <label for="event-properties__shadesmar">
          <input id="event-properties__shadesmar" v-model="event.shadesmar" type="checkbox">

          Shadesmar
        </label>
        <label for="event-properties__perpendicularity">
          <input id="event-properties__perpendicularity" v-model="event.perpendicularity" type="checkbox">

          Perpendicularity
        </label>
      </div>

      <label for="event-properties__special-effect">Special Effect</label>
      <select id="event-properties__special-effect" v-model="event.specialEffect">
        <option :value="undefined">
          None
        </option>
        <option value="shattering">
          The Shattering
        </option>
      </select>

      <label>Tags</label>
      <VueTagsInput
        v-model="newTag"
        :tags="event.tags.map(t => ({ text: t }))"
        :autocomplete-items="availableTags.map(t => ({ text: t }))"
        @tags-changed="newTags => event.tags = newTags.map(t => t.text)"
      />

      <div class="event-properties__image">
        <h3>Image</h3>

        <label for="event-properties__image--file">File</label>
        <input
          id="event-properties__image--file"
          :value="event.image !== undefined ? event.image.file : undefined"
          type="text"
          @input="updateImageFile"
        >

        <template v-if="event.image !== undefined">
          <div class="event-properties__image-preview-container">
            <div
              :style="buildImageStyles(event.image)"
              class="event-properties__image-preview"
            />
          </div>

          <div class="event-properties__coordinates event-properties__coordinates--units">
            <h4>Offset</h4>

            <label for="event-properties__coordinates--image-x">X</label>
            <input
              id="event-properties__coordinates--image-x"
              :value="event.image.offset !== undefined ? event.image.offset.x : 0"
              type="number"
              min="0"
              max="100"
              step="any"
              @input="updateImageOffset('x', $event)"
            >

            %

            <label for="event-properties__coordinates--image-y">Y</label>
            <input
              id="event-properties__coordinates--image-y"
              :value="event.image.offset !== undefined ? event.image.offset.y : 0"
              type="number"
              min="0"
              max="100"
              step="any"
              @input="updateImageOffset('y', $event)"
            >

            %
          </div>

          <div class="event-properties__image-size">
            <label for="event-properties__image--size">Size</label>
            <input
              id="event-properties__image--size"
              :value="event.image.size !== undefined ? event.image.size : 100"
              type="number"
              min="0"
              step="any"
              @input="updateImageSize"
            >
            %
          </div>
        </template>
      </div>
      <label for="event-properties__has-details">
        <input id="event-properties__has-details" v-model="event.details" type="checkbox">

        Details
      </label>
      <button :disabled="event.details !== true || selectedLanguage === null" @click="startEditDetails">
        Edit
      </button>
    </div>

    <div v-if="editingDetails" class="event-properties__details-editor">
      <div class="event-properties__details-editor-content">
        <textarea v-model="editedDetails" aria-label="Details" />
        <Markdown class="event-properties__details-editor-preview" :content="editedDetails" />

        <div class="event-properties__details-editor-buttons">
          <button @click="editingDetails = false">
            Cancel
          </button>
          <button @click="saveDetails">
            Save
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input'
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'EventProperties',
  components: { VueTagsInput, Markdown },
  props: {
    event: {
      type: Object,
      required: true
    },
    selectedLanguage: {
      type: [String, null],
      required: false,
      default: () => null
    },
    languages: {
      type: Object,
      required: true
    },
    availableTags: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      dateText: this.event.date.join('.'),
      editingDetails: false,
      editedDetails: '',
      newTag: ''
    }
  },
  computed: {
    imageBaseUrl () {
      return `${process.env.BASE_URL}img/events`
    },
    selectedMessages () {
      return this.selectedLanguage !== null ? this.languages[this.selectedLanguage] : null
    },
    displayName () {
      return this.selectedMessages?.events?.[this.event.id]?.name ?? ''
    },
    displayBlurb () {
      return this.selectedMessages?.events?.[this.event.id]?.blurb ?? ''
    },
    displayDetails () {
      return this.selectedMessages?.events?.[this.event.id]?.details ?? ''
    }
  },
  watch: {
    event (newEvent) {
      this.dateText = newEvent.date.join('.')
    },
    'event.id' (newId, oldId) {
      Object.keys(this.languages).forEach((lang) => {
        const language = this.languages[lang]

        if (language.events !== undefined && language.events[oldId] !== undefined) {
          language.events[newId] = { ...(language.events[newId] || {}), ...language.events[oldId] }
          this.$delete(language.events, oldId)
        }
      })
    }
  },
  methods: {
    updateDate ({ target: { value } }) {
      if (value.match(/^-?\d+(\.\d+)*$/) !== null) {
        this.event.date = value.split('.').map(d => Number.parseInt(d, 10))
      }
    },
    updateTieBreaker ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.event, 'tieBreaker')
        return
      }

      this.$set(this.event, 'tieBreaker', Number.parseInt(trimmed, 10))
    },
    updateLangProperty (property, { target: { value } }) {
      const trimmed = value.trim()

      if (this.selectedMessages.events === undefined) {
        this.selectedMessages.events = {}
      }

      if (this.selectedMessages.events[this.event.id] === undefined) {
        this.selectedMessages.events[this.event.id] = {}
      }

      if (trimmed.length === 0) {
        this.$delete(this.selectedMessages.events[this.event.id], property)
      } else {
        this.$set(this.selectedMessages.events[this.event.id], property, trimmed)
      }

      if (Object.keys(this.selectedMessages.events[this.event.id]).length === 0) {
        this.$delete(this.selectedMessages.events, this.event.id)
      }
    },
    updateImageFile ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.event.image = undefined
        return
      }

      if (this.event.image === undefined) {
        this.event.image = {}
      }

      this.event.image.file = trimmed
    },
    updateImageOffset (prop, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.event.image.offset = undefined
        return
      }

      if (this.event.image.offset === undefined) {
        this.event.image.offset = { x: 0, y: 0 }
      }

      this.event.image.offset[prop] = Number.parseInt(trimmed, 10)

      if (this.event.image.offset.x === 0 && this.event.image.offset.y === 0) {
        this.event.image.offset = undefined
      }
    },
    updateImageSize ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.event.image.size = undefined
        return
      }

      this.event.image.size = Number.parseInt(trimmed, 10)

      if (this.event.image.size === 100) {
        this.event.image.size = undefined
      }
    },
    buildImageStyles (image) {
      const styles = {
        backgroundImage: `url(${this.imageBaseUrl}/${image.file})`
      }

      if (image.offset !== undefined) {
        styles.backgroundPosition = `${image.offset.x}% ${image.offset.y}%`
      }

      if (image.size !== undefined) {
        styles.backgroundSize = `${image.size}%`
      }

      return styles
    },
    startEditDetails () {
      this.editedDetails = this.displayDetails
      this.editingDetails = true
    },
    saveDetails () {
      this.updateLangProperty('details', { target: { value: this.editedDetails } })
      this.editingDetails = false
    }
  }
}
</script>

<style lang="scss">
.event-properties {
  width: 350px;
  padding: 1rem;
  box-sizing: border-box;
  z-index: 100 !important;

  h2 {
    margin: 0;
    padding: 0;
  }

  &__form {
    display: grid;
    grid-template-columns: auto 1fr;
    padding-top: 1rem;
    grid-gap: 0.5rem;
    align-items: center;

    textarea {
      resize: vertical;
    }
  }

  &__coordinates {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
    grid-column: 1 / span 2;
    align-items: center;
    grid-gap: 0.5rem;

    h3, h4 {
      margin: 0;
      grid-column: 1 / span 4;
    }

    input[type="number"] {
      width: auto;
    }

    &--units {
      grid-template-columns: auto minmax(0, 1fr) auto auto minmax(0, 1fr) auto;

      h3, h4 {
        grid-column: 1 / span 6;
      }
    }
  }

  &__checkboxes {
    grid-column: 1 / span 2;
  }

  &__image {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 0.5rem;
    grid-column: 1 / span 2;
    align-items: center;

    h3 {
      margin: 0;
      grid-column: 1 / span 2;
    }

    &-preview {
      width: 120px;
      height: 120px;
      background-size: 100%;
      border-radius: 100%;
      border: 4px solid #F5ECDA;
      box-sizing: border-box;

      &-container {
        display: flex;
        justify-content: center;
        grid-column: 1 / span 2;
      }
    }

    &-size {
      display: grid;
      align-items: center;
      grid-column: 1 / span 2;
      grid-gap: 0.25rem;
      grid-template-columns: auto minmax(0, 1fr) auto;

      input {
        margin-left: 0.25rem;
      }
    }
  }

  &__details-editor {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;

    &-content {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: 1fr auto;
      width: 40%;
      height: 50%;
    }

    textarea, &-preview {
      box-sizing: border-box;
      padding: 20px;
      border: none;
      resize: none;
      outline: none;
    }

    textarea {
      font-size: 14px;
      font-family: "Monaco", courier, monospace;
      border-right: 1px solid #ccc;
      background-color: #f6f6f6;
    }

    &-preview {
      font-family: 'Lora', serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background: #F5ECDA url(../../assets/paper.png);
      width: 350px;
      overflow-y: auto;
      color: #242629;
      text-align: justify;
    }

    &-buttons {
      grid-column: 1 / span 2;
      text-align: right;
      padding: 0.5rem;
      border-top: 1px solid #ccc;
      background-color: #d2d2d2;

      button {
        margin: 0 0.25rem;
      }
    }
  }
}
</style>
