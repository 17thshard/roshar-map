<template>
  <section class="location-properties">
    <h2>Location properties</h2>
    <div class="location-properties__form">
      <label for="location-properties__id">ID</label>
      <input id="location-properties__id" v-model.number="location.id" min="0" max="255" type="number">

      <label for="location-properties__slug">Slug</label>
      <input id="location-properties__slug" v-model="location.name" type="text">

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
  </section>
</template>

<script>
export default {
  name: 'LocationProperties',
  props: {
    location: {
      type: Object,
      required: true
    }
  },
  computed: {
    imageBaseUrl () {
      return `${process.env.BASE_URL}img/locations`
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
}
</style>
