<template>
  <section class="location-properties">
    <h2>Location properties</h2>
    <div class="location-properties__form">
      <label for="location-properties__slug">ID</label>
      <input id="location-properties__slug" v-model="location.id" type="text">

      <div class="location-properties__coordinates">
        <h3>Coordinates</h3>

        <label for="location-properties__coordinates--x">X</label>
        <input
          id="location-properties__coordinates--x"
          v-model.number="location.coordinates.x"
          type="number"
          min="0"
          max="1024"
          step="any"
        >

        <label for="location-properties__coordinates--y">Y</label>
        <input
          id="location-properties__coordinates--y"
          v-model.number="location.coordinates.y"
          type="number"
          min="0"
          max="512"
          step="any"
        >

        <label for="location-properties__coordinates--zoom">Zoom</label>
        <input
          id="location-properties__coordinates--zoom"
          :value="location.coordinates.zoom"
          type="number"
          min="0"
          max="1"
          step="any"
          @input="updateZoom"
        >
      </div>

      <div class="location-properties__checkboxes">
        <label for="location-properties__shadesmar">
          <input
            id="location-properties__shadesmar"
            :checked="location.shadesmar"
            type="checkbox"
            @input="$event.target.checked ? $set(location, 'shadesmar', true) : $delete(location, 'shadesmar')"
          >

          Shadesmar
        </label>
        <label for="location-properties__city-dot">
          <input
            id="location-properties__city-dot"
            :checked="location.cityDot"
            type="checkbox"
            @input="$event.target.checked ? $set(location, 'cityDot', true) : $delete(location, 'cityDot')"
          >

          City Dot
        </label>
      </div>

      <label for="location-properties__id">Map ID</label>
      <input
        id="location-properties__id"
        :value="location.mapId"
        min="0"
        max="255"
        type="number"
        @input="updateMapId"
      >

      <label>Related</label>
      <VueTagsInput
        v-model="newLink"
        :tags="(location.related || []).map(t => ({ text: t }))"
        :autocomplete-items="linkAutocompletions"
        add-only-from-autocomplete
        placeholder="Add Link"
        @tags-changed="newLinks => $set(location, 'related', newLinks.map(t => t.text).sort((a, b) => a.localeCompare(b)))"
      />

      <span>Linked to by</span>
      <ul class="location-properties__linked">
        <li v-if="linked.length === 0">
          Nothing
        </li>
        <li v-for="item in linked" :key="item">
          {{ item }}
        </li>
      </ul>

      <div class="location-properties__image">
        <h3>Image</h3>

        <label for="location-properties__image--file">File</label>
        <input
          id="location-properties__image--file"
          :value="location.image !== undefined ? location.image.file : undefined"
          type="text"
          @input="updateImageFile"
        >

        <template v-if="location.image !== undefined">
          <label for="location-properties__image--credits">Credits</label>
          <input
            id="location-properties__image--credits"
            v-model="location.image.credits"
            type="text"
          >
          <div class="location-properties__image-preview-container">
            <div
              :style="imageStyles"
              class="location-properties__image-preview"
            />
          </div>

          <div class="location-properties__coordinates location-properties__coordinates--units">
            <h4>Offset</h4>

            <label for="location-properties__coordinates--image-x">X</label>
            <input
              id="location-properties__coordinates--image-x"
              :value="location.image.offset !== undefined ? location.image.offset.x : 0"
              type="number"
              min="-100"
              max="100"
              step="any"
              @input="updateImageOffset('x', $event)"
            >

            %

            <label for="location-properties__coordinates--image-y">Y</label>
            <input
              id="location-properties__coordinates--image-y"
              :value="location.image.offset !== undefined ? location.image.offset.y : 0"
              type="number"
              min="-100"
              max="100"
              step="any"
              @input="updateImageOffset('y', $event)"
            >

            %
          </div>

          <div class="location-properties__image-size">
            <label for="location-properties__image--size">Size</label>
            <input
              id="location-properties__image--size"
              :value="location.image.size !== undefined ? location.image.size : 100"
              type="number"
              min="0"
              step="any"
              @input="updateImageSize"
            >
            %
          </div>
        </template>
      </div>

      <label for="location-properties__coppermind">Coppermind Article</label>
      <input
        id="location-properties__coppermind"
        :value="location.coppermind"
        type="text"
        @input="update('coppermind', $event)"
      >
    </div>
  </section>
</template>

<script>
import VueTagsInput from '@johmun/vue-tags-input'
import { getEntryImageSrcSet } from '@/utils'

export default {
  name: 'LocationProperties',
  components: { VueTagsInput },
  props: {
    location: {
      type: Object,
      required: true
    },
    linked: {
      type: Array,
      required: false,
      default: () => []
    },
    linkables: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      newLink: ''
    }
  },
  computed: {
    imageBaseUrl () {
      return `${import.meta.env.BASE_URL}img`
    },
    linkAutocompletions () {
      return this.linkables.filter(l => l.startsWith(this.newLink) && l !== `locations/${this.location.id}`)
        .sort((a, b) => a.localeCompare(b))
        .map(l => ({ text: l }))
    },
    imageStyles () {
      if (this.location.image === undefined) {
        return
      }

      const styles = {
        backgroundImage: getEntryImageSrcSet(this.location.image.file, this.$gtag).css
      }

      if (this.location.image.offset !== undefined) {
        styles.backgroundPosition = `${this.location.image.offset.x}% ${this.location.image.offset.y}%`
      }

      if (this.location.image.size !== undefined) {
        styles.backgroundSize = `${this.location.image.size}%`
      }

      return styles
    }
  },
  methods: {
    updateMapId ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location, 'mapId')
        this.$delete(this.location, 'points')
        return
      }

      this.$set(this.location, 'mapId', Number.parseInt(trimmed))

      if (this.location.points === undefined) {
        this.$set(this.location, 'points', {})
      }
    },
    updateZoom ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location.coordinates, 'zoom')
        return
      }

      this.$set(this.location.coordinates, 'zoom', Number.parseFloat(trimmed))
    },
    updateImageFile ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location, 'image')
        return
      }

      if (this.location.image === undefined) {
        this.$set(this.location, 'image', {})
      }

      this.location.image.file = trimmed
    },
    updateImageOffset (prop, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location.image, 'offset')
        return
      }

      if (this.location.image.offset === undefined) {
        this.$set(this.location.image, 'offset', { x: 0, y: 0 })
      }

      this.$set(this.location.image.offset, prop, Number.parseInt(trimmed, 10))

      if (this.location.image.offset.x === 0 && this.location.image.offset.y === 0) {
        this.$delete(this.location.image, 'offset')
      }
    },
    updateImageSize ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location.image, 'size')
        return
      }

      this.$set(this.location.image, 'size', Number.parseInt(trimmed, 10))

      if (this.location.image.size === 100) {
        this.$delete(this.location.image, 'size')
      }
    },
    update (property, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location, property)
        return
      }

      this.$set(this.location, property, trimmed)
    }
  }
}
</script>

<style lang="scss">
.location-properties {
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

    img {
      grid-column: 1 / span 2;
      max-width: 100%;
    }

    button {
      grid-column: 1 / span 2;
    }
  }

  &__checkboxes {
    grid-column: 1 / span 2;
  }

  &__coordinates {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
    grid-column: 1 / span 2;
    align-items: center;
    grid-gap: 0.5rem;

    h3, h4 {
      margin: 0;
      grid-column: 1 / span 6;
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
      width: 115px;
      height: 115px;
      clip-path: polygon(
          2rem 0,
          calc(100% - 2rem) 0,
          100% 2rem,
          100% calc(100% - 2rem),
          calc(100% - 2rem) 100%,
          2rem 100%,
          0 calc(100% - 2rem),
          0 2rem
      );
      background-size: 100%;
      box-sizing: border-box;
      background-repeat: no-repeat;
      background-color: #0f3562;

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

  &__linked {
    padding: 0;
    margin: 0;
  }
}
</style>
