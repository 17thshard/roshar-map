<template>
  <section class="tag-properties">
    <h2>Tag properties</h2>
    <div class="tag-properties__form">
      <label for="tag-properties__id">ID</label>
      <input id="tag-properties__id" :value="tag.id" readonly type="text">

      <template v-if="selectedLanguage !== null">
        <label for="tag-properties__name">Name</label>
        <input
          id="tag-properties__name"
          :value="displayName"
          type="text"
          @input="updateName"
        >
      </template>

      <template v-if="!category">
        <label for="tag-properties__color">Color</label>
        <input id="tag-properties__color" v-model="tag.color" type="color">
        <label for="tag-properties__alpha">Alpha</label>
        <div>
          <input
            id="tag-properties__alpha"
            :value="alpha"
            step="1"
            type="number"
            @input="tag.alpha = parseFloat($event.target.value) / 100"
          >
          %
        </div>
        <span>Preview</span>
        <div class="tag-properties__preview" :style="previewStyles" />
      </template>
    </div>
  </section>
</template>

<script>
import { parseColorToCssVar } from '@/utils'

export default {
  name: 'TagProperties',
  props: {
    tag: {
      type: Object,
      required: true
    },
    category: {
      type: Boolean
    },
    selectedLanguage: {
      type: [String, null],
      required: false,
      default: () => null
    },
    languages: {
      type: Object,
      required: true
    }
  },
  computed: {
    selectedMessages () {
      return this.selectedLanguage !== null ? this.languages[this.selectedLanguage] : null
    },
    languageNamespace: {
      get () {
        return this.category ? this.selectedMessages?.tagCategories : this.selectedMessages?.tags
      },
      set (value) {
        const key = this.category ? 'tagCategories' : 'tags'

        if (value === undefined) {
          this.$delete(this.selectedMessages, key)
        } else {
          this.$set(this.selectedMessages, key, value)
        }
      }
    },
    displayName () {
      return this.languageNamespace?.[this.tag] ?? ''
    },
    alpha () {
      return this.category ? 0 : Math.round(this.tag.alpha * 100)
    },
    previewStyles () {
      if (this.category) {
        return undefined
      }

      return {
        '--color': parseColorToCssVar(this.tag.color),
        '--alpha': this.tag.alpha
      }
    }
  },
  methods: {
    updateName ({ target: { value } }) {
      const trimmed = value.trim()

      if (this.languageNamespace === undefined) {
        this.languageNamespace = {}
      }

      if (trimmed.length === 0) {
        this.$delete(this.languageNamespace, this.tag)
      } else {
        this.$set(this.languageNamespace, this.tag, trimmed)
      }
    }
  }
}
</script>

<style lang="scss">
.tag-properties {
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
  }

  &__preview {
    height: 2rem;
    background: #F5ECDA url(../../assets/paper.png);
    display: flex;
    align-items: center;
    justify-content: stretch;
    padding: 0 0.5rem;

    &:before {
      content: '';
      display: block;
      width: 100%;
      height: 1rem;
      background: rgba(var(--color), var(--alpha));
    }
  }
}
</style>
