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
        @tags-changed="newLinks => $set(misc, 'related', newLinks.map(t => t.text))"
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

      <label for="misc-properties__image">Image</label>
      <input
        id="misc-properties__image"
        :value="misc.image !== undefined ? misc.image.file : undefined"
        type="text"
        @input="updateImageFile"
      >

      <label v-if="misc.image !== undefined" for="misc-properties__image--credits">Image Credits</label>
      <input
        v-if="misc.image !== undefined"
        id="misc-properties__image--credits"
        v-model="misc.image.credits"
        type="text"
      >

      <img v-if="misc.image !== undefined" :src="`${imageBaseUrl}/${misc.image.file}`" :alt="misc.id">

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
      return `${process.env.BASE_URL}img/misc`
    },
    linkAutocompletions () {
      return this.linkables.filter(l => l.startsWith(this.newLink) && l !== `misc/${this.misc.id}`).map(l => ({ text: l }))
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
}
</style>
