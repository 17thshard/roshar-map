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
        @tags-changed="newLinks => $set(character, 'related', newLinks.map(t => t.text))"
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

      <label for="character-properties__image">Image</label>
      <input
        id="character-properties__image"
        :value="character.image !== undefined ? character.image.file : undefined"
        type="text"
        @input="updateImageFile"
      >

      <label v-if="character.image !== undefined" for="character-properties__image--credits">Image Credits</label>
      <input
        v-if="character.image !== undefined"
        id="character-properties__image--credits"
        v-model="character.image.credits"
        type="text"
      >

      <img v-if="character.image !== undefined" :src="`${imageBaseUrl}/${character.image.file}`" :alt="character.id">

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
      return `${process.env.BASE_URL}img/characters`
    },
    linkAutocompletions () {
      return this.linkables.filter(l => l.startsWith(this.newLink) && l !== `characters/${this.character.id}`).map(l => ({ text: l }))
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
}
</style>
