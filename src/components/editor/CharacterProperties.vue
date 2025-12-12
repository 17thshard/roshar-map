<template>
  <section class="character-properties">
    <h2>Character properties</h2>
    <div class="character-properties__form">
      <label for="character-properties__slug">ID</label>
      <input id="character-properties__slug" v-model="character.id" type="text">

      <label>Related</label>
      <VueTagsInput
        v-model="newLink"
        :tags="(character.related || []).map(t => ({ text: t }))"
        :autocomplete-items="linkAutocompletions"
        add-only-from-autocomplete
        placeholder="Add Link"
        @tags-changed="newLinks => $set(character, 'related', newLinks.map(t => t.text).sort((a, b) => a.localeCompare(b)))"
      />

      <span>Linked to by</span>
      <ul class="character-properties__linked">
        <li v-if="linked.length === 0">
          Nothing
        </li>
        <li v-for="item in linked" :key="item">
          {{ item }}
        </li>
      </ul>

      <div class="character-properties__image">
        <h3>Image</h3>

        <label for="character-properties__image--file">File</label>
        <input
          id="character-properties__image--file"
          :value="character.image !== undefined ? character.image.file : undefined"
          type="text"
          @input="updateImageFile"
        >

        <template v-if="character.image !== undefined">
          <label for="character-properties__image--credits">Credits</label>
          <input
            id="character-properties__image--credits"
            v-model="character.image.credits"
            type="text"
          >
          <div class="character-properties__image-preview-container">
            <div
              :style="imageStyles"
              class="character-properties__image-preview"
            />
          </div>

          <div class="character-properties__coordinates character-properties__coordinates--units">
            <h4>Offset</h4>

            <label for="character-properties__coordinates--image-x">X</label>
            <input
              id="character-properties__coordinates--image-x"
              :value="character.image.offset !== undefined ? character.image.offset.x : 0"
              type="number"
              min="-100"
              max="100"
              step="any"
              @input="updateImageOffset('x', $event)"
            >

            %

            <label for="character-properties__coordinates--image-y">Y</label>
            <input
              id="character-properties__coordinates--image-y"
              :value="character.image.offset !== undefined ? character.image.offset.y : 0"
              type="number"
              min="-100"
              max="100"
              step="any"
              @input="updateImageOffset('y', $event)"
            >

            %
          </div>

          <div class="character-properties__image-size">
            <label for="character-properties__image--size">Size</label>
            <input
              id="character-properties__image--size"
              :value="character.image.size !== undefined ? character.image.size : 100"
              type="number"
              min="0"
              step="any"
              @input="updateImageSize"
            >
            %
          </div>
        </template>
      </div>

      <label for="character-properties__coppermind">Coppermind Article</label>
      <input
        id="character-properties__coppermind"
        :value="character.coppermind"
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
  name: 'CharacterProperties',
  components: { VueTagsInput },
  props: {
    character: {
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
      return this.linkables.filter(l => l.startsWith(this.newLink) && l !== `characters/${this.character.id}`)
        .sort((a, b) => a.localeCompare(b))
        .map(l => ({ text: l }))
    },
    imageStyles () {
      if (this.character.image === undefined) {
        return
      }

      const styles = {
        backgroundImage: getEntryImageSrcSet(this.character.image.file, this.$gtag).css
      }

      if (this.character.image.offset !== undefined) {
        styles.backgroundPosition = `${this.character.image.offset.x}% ${this.character.image.offset.y}%`
      }

      if (this.character.image.size !== undefined) {
        styles.backgroundSize = `${this.character.image.size}%`
      }

      return styles
    }
  },
  methods: {
    updateImageFile ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.character, 'image')
        return
      }

      if (this.character.image === undefined) {
        this.$set(this.character, 'image', {})
      }

      this.character.image.file = trimmed
    },
    updateImageOffset (prop, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.character.image, 'offset')
        return
      }

      if (this.character.image.offset === undefined) {
        this.$set(this.character.image, 'offset', { x: 0, y: 0 })
      }

      this.$set(this.character.image.offset, prop, Number.parseInt(trimmed, 10))

      if (this.character.image.offset.x === 0 && this.character.image.offset.y === 0) {
        this.$delete(this.character.image, 'offset')
      }
    },
    updateImageSize ({ target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.character.image, 'size')
        return
      }

      this.$set(this.character.image, 'size', Number.parseInt(trimmed, 10))

      if (this.character.image.size === 100) {
        this.$delete(this.character.image, 'size')
      }
    },
    update (property, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.character, property)
        return
      }

      this.$set(this.character, property, trimmed)
    }
  }
}
</script>

<style lang="scss">
.character-properties {
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
