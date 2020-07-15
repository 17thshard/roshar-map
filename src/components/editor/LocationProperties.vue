<template>
  <section class="location-properties">
    <h2>Location properties</h2>
    <div class="location-properties__form">
      <label for="location-properties__id">ID</label>
      <input id="location-properties__id" v-model.number="location.id" min="0" max="255" type="number">

      <label for="location-properties__slug">Slug</label>
      <input id="location-properties__slug" v-model="location.name" type="text">

      <template v-if="selectedLanguage !== null">
        <label for="location-properties__name">Name</label>
        <input
          id="location-properties__name"
          :value="displayName"
          type="text"
          @input="updateLangProperty('name', $event)"
        >
      </template>

      <button @click="startEditDetails">
        Edit Details
      </button>

      <label for="location-properties__image">Image</label>
      <input
        id="location-properties__image"
        :value="location.image"
        type="text"
        @input="update('image', $event)"
      >

      <img v-if="location.image !== undefined" :src="`${imageBaseUrl}/${location.image}`" :alt="location.name" />

      <label for="location-properties__coppermind">Coppermind Article</label>
      <input
        id="location-properties__coppermind"
        :value="location.coppermind"
        type="text"
        @input="update('coppermind', $event)"
      >
    </div>

    <div v-if="editingDetails" class="location-properties__details-editor">
      <div class="location-properties__details-editor-content">
        <textarea v-model="editedDetails" aria-label="Details" />
        <Markdown class="location-properties__details-editor-preview" :content="editedDetails" />

        <div class="location-properties__details-editor-buttons">
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
import Markdown from '@/components/Markdown.vue'

export default {
  name: 'LocationProperties',
  components: { Markdown },
  props: {
    location: {
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
  data () {
    return {
      editingDetails: false,
      editedDetails: ''
    }
  },
  computed: {
    imageBaseUrl () {
      return `${process.env.BASE_URL}img/locations`
    },
    selectedMessages () {
      return this.selectedLanguage !== null ? this.languages[this.selectedLanguage] : null
    },
    displayName () {
      return this.selectedMessages?.locations?.[this.location.name]?.name ?? ''
    },
    displayDetails () {
      return this.selectedMessages?.locations?.[this.location.name]?.details ?? ''
    }
  },
  watch: {
    'location.name' (newId, oldId) {
      Object.keys(this.languages).forEach((lang) => {
        const language = this.languages[lang]

        if (language.locations !== undefined && language.locations[oldId] !== undefined) {
          language.locations[newId] = { ...(language.locations[newId] || {}), ...language.locations[oldId] }
          this.$delete(language.locations, oldId)
        }
      })
    }
  },
  methods: {
    updateLangProperty (property, { target: { value } }) {
      const trimmed = value.trim()

      if (this.selectedMessages.locations === undefined) {
        this.selectedMessages.locations = {}
      }

      if (this.selectedMessages.locations[this.location.name] === undefined) {
        this.selectedMessages.locations[this.location.name] = {}
      }

      if (trimmed.length === 0) {
        this.$delete(this.selectedMessages.locations[this.location.name], property)
      } else {
        this.$set(this.selectedMessages.locations[this.location.name], property, trimmed)
      }

      if (Object.keys(this.selectedMessages.locations[this.location.name]).length === 0) {
        this.$delete(this.selectedMessages.locations, this.location.name)
      }
    },
    update (property, { target: { value } }) {
      const trimmed = value.trim()

      if (trimmed.length === 0) {
        this.$delete(this.location, property)
        return
      }

      this.$set(this.location, property, trimmed)
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
