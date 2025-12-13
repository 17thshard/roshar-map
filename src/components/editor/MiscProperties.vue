<template>
  <section class="misc-properties">
    <h2>Misc properties</h2>
    <div class="misc-properties__form">
      <label for="misc-properties__slug">ID</label>
      <input id="misc-properties__slug" v-model="misc.id" type="text">

      <label>Related</label>
      <VueTagsInput
        v-model="newLink"
        :tags="(misc.related || []).map(t => ({ text: t }))"
        :autocomplete-items="linkAutocompletions"
        add-only-from-autocomplete
        placeholder="Add Link"
        @tags-changed="newLinks => $set(misc, 'related', newLinks.map(t => t.text).sort((a, b) => a.localeCompare(b)))"
      />

      <span>Linked to by</span>
      <ul class="misc-properties__linked">
        <li v-if="linked.length === 0">
          Nothing
        </li>
        <li v-for="item in linked" :key="item">
          {{ item }}
        </li>
      </ul>

      <div class="misc-properties__image">
        <h3>Image</h3>

        <label for="misc-properties__image--file">File</label>
        <input
          id="misc-properties__image--file"
          :value="misc.image !== undefined ? misc.image.file : undefined"
          type="text"
          @input="updateImageFile"
        >

        <template v-if="misc.image !== undefined">
          <label for="misc-properties__image--credits">Credits</label>
          <input
            id="misc-properties__image--credits"
            v-model="misc.image.credits"
            type="text"
          >
          <div class="misc-properties__image-preview-container">
            <div
              :style="imageStyles"
              class="misc-properties__image-preview"
            />
          </div>

          <div class="misc-properties__coordinates misc-properties__coordinates--units">
            <h4>Offset</h4>

            <label for="misc-properties__coordinates--image-x">X</label>
            <input
              id="misc-properties__coordinates--image-x"
              :value="misc.image.offset !== undefined ? misc.image.offset.x : 0"
              type="number"
              min="-100"
              max="100"
              step="any"
              @input="updateImageOffset('x', $event)"
            >

            %

            <label for="misc-properties__coordinates--image-y">Y</label>
            <input
              id="misc-properties__coordinates--image-y"
              :value="misc.image.offset !== undefined ? misc.image.offset.y : 0"
              type="number"
              min="-100"
              max="100"
              step="any"
              @input="updateImageOffset('y', $event)"
            >

            %
          </div>

          <div class="misc-properties__image-size">
            <label for="misc-properties__image--size">Size</label>
            <input
              id="misc-properties__image--size"
              :value="misc.image.size !== undefined ? misc.image.size : 100"
              type="number"
              min="0"
              step="any"
              @input="updateImageSize"
            >
            %
          </div>
        </template>
      </div>

      <label for="misc-properties__coppermind">Coppermind Article</label>
      <input
        id="misc-properties__coppermind"
        :value="misc.coppermind"
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
  name: 'MiscProperties',
  components: { VueTagsInput },
  props: {
    misc: {
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
      return this.linkables.filter(l => l.startsWith(this.newLink) && l !== `misc/${this.misc.id}`)
        .sort((a, b) => a.localeCompare(b))
        .map(l => ({ text: l }))
    },
    imageStyles () {
      if (this.misc.image === undefined) {
        return
      }

      const styles = {
        backgroundImage: getEntryImageSrcSet(this.misc.image.file, this.$gtag).css
      }

      if (this.misc.image.offset !== undefined) {
        styles.backgroundPosition = `${this.misc.image.offset.x}% ${this.misc.image.offset.y}%`
      }

      if (this.misc.image.size !== undefined) {
        styles.backgroundSize = `${this.misc.image.size}%`
      }

      return styles
    }
  },
  methods: {
    updateImageFile ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.misc, 'image')
        return
      }

      if (this.misc.image === undefined) {
        this.$set(this.misc, 'image', {})
      }

      this.misc.image.file = trimmed
    },
    updateImageOffset (prop, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.misc.image, 'offset')
        return
      }

      if (this.misc.image.offset === undefined) {
        this.$set(this.misc.image, 'offset', { x: 0, y: 0 })
      }

      this.$set(this.misc.image.offset, prop, Number.parseInt(trimmed, 10))

      if (this.misc.image.offset.x === 0 && this.misc.image.offset.y === 0) {
        this.$delete(this.misc.image, 'offset')
      }
    },
    updateImageSize ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.misc.image, 'size')
        return
      }

      this.$set(this.misc.image, 'size', Number.parseInt(trimmed, 10))

      if (this.misc.image.size === 100) {
        this.$delete(this.misc.image, 'size')
      }
    },
    update (property, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.misc, property)
        return
      }

      this.$set(this.misc, property, trimmed)
    }
  }
}
</script>

<style lang="scss">
.misc-properties {
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

  &__linked {
    padding: 0;
    margin: 0;
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
}
</style>
