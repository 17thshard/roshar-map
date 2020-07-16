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

      <div class="event-properties__coordinates">
        <h3>
          Coordinates
          <label for="event-properties__hide-marker">
            <input id="event-properties__hide-marker" v-model="event.hideMarker" type="checkbox">

            Hide marker
          </label>
        </h3>

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
        <label for="event-properties__circa">
          <input id="event-properties__circa" v-model="event.circa" type="checkbox">

          Circa
        </label>
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

      <label for="event-properties__coppermind">Coppermind Article</label>
      <input
        id="event-properties__coppermind"
        :value="event.coppermind"
        type="text"
        @input="update('coppermind', $event)"
      >

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
    </div>
  </section>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input'

export default {
  name: 'EventProperties',
  components: { VueTagsInput },
  props: {
    event: {
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
      newTag: ''
    }
  },
  computed: {
    imageBaseUrl () {
      return `${process.env.BASE_URL}img/events`
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
    update (property, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location, property)
        return
      }

      this.$set(this.event, property, trimmed)
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
}
</style>
