<template>
  <section class="tag-properties">
    <h2>Tag properties</h2>
    <div class="tag-properties__form">
      <label for="tag-properties__id">ID</label>
      <input id="tag-properties__id" :value="tag" readonly type="text">

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
        <label for="tag-properties__category">Category</label>
        <select id="tag-properties__category" @change="reassignTag">
          <option selected disabled>
            None
          </option>
          <option v-for="(tags, tagCategory) in tagCategories" :key="tagCategory" :value="tagCategory" :selected="tags.includes(tag)">
            {{ tagCategory }}
          </option>
        </select>
      </template>
    </div>
  </section>
</template>

<script>
export default {
  name: 'TagProperties',
  props: {
    tag: {
      type: String,
      required: true
    },
    category: {
      type: Boolean
    },
    tagCategories: {
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
    }
  },
  methods: {
    updateName ({ target: { value } }) {
      const trimmed = value.trim()

      if (this.languageNamespace === undefined) {
        this.languageNamespace = {}
      }

      if (trimmed.length === 0) {
        this.$delete(this.selectedMessages.languageNamespace, this.tag)
      } else {
        this.$set(this.selectedMessages.languageNamespace, this.tag, trimmed)
      }
    },
    reassignTag (event) {
      const newCategory = event.target.value

      Object.keys(this.tagCategories).forEach((tagCategory) => {
        const index = this.tagCategories[tagCategory].indexOf(this.tag)

        if (index === -1) {
          return
        }

        this.tagCategories[tagCategory].splice(index, 1)
      })

      this.tagCategories[newCategory].push(this.tag)
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
}
</style>
