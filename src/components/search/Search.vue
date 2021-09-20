<template>
  <div :class="['search', { 'search--open': open }]">
    <button :disabled="open" class="search__button" :title="$t('ui.search.title')" @click="$emit('open')">
      <SearchIcon size="1x" />
    </button>
    <transition name="search__content">
      <div v-show="open" class="search__content">
        <input
          key="field"
          ref="field"
          v-model="query"
          type="search"
          class="search__field"
          @focusin="fieldFocused = true"
          @focusout="fieldFocused = false"
        >
        <button key="close-button" class="search__button" :title="$t('ui.close')" @click="$emit('close')">
          <XIcon size="1x" />
        </button>
      </div>
    </transition>
    <transition name="search__results">
      <SearchResults
        v-if="open"
        class="search__results"
        :results="searchResults"
        :loading="loadingIndex"
        :empty-query="query.trim().length === 0"
      />
    </transition>
  </div>
</template>

<script>
import { SearchIcon, XIcon } from 'vue-feather-icons'
import SearchResults from '@/components/search/SearchResults.vue'

export default {
  name: 'Search',
  components: { SearchResults, SearchIcon, XIcon },
  props: {
    open: Boolean
  },
  data () {
    return {
      query: '',
      loadingIndex: true,
      searchResults: [],
      fieldFocused: false
    }
  },
  watch: {
    async open (value) {
      if (value) {
        this.query = ''
        this.$nextTick(() => {
          this.$refs.field.focus()
        })
        await this.$store.dispatch('search/loadIndex', this.$t('sourceFile'))
        this.loadingIndex = false
        this.search(this.query)
      }
    },
    query (value) {
      this.search(value)
    }
  },
  methods: {
    search (query) {
      if (this.loadingIndex) {
        this.searchResults = []
        return
      }

      if (this.query.trim().length === 0) {
        this.searchResults = []
        return
      }

      const index = this.$store.state.search.loadedIndices[this.$t('sourceFile')]
      this.searchResults = index.search(query).map(result => result.ref)
    }
  }
}
</script>

<style lang="scss">
.search {
  position: relative;
  display: flex;

  &:before {
    content: '';
    position: absolute;
    border-radius: 2rem;
    background: #F5ECDA;
    box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.5);
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 2;
  }

  &__button {
    display: flex;
    align-items: center;
    position: relative;
    font-size: 1rem;
    line-height: 1;
    appearance: none;
    outline: none;
    box-sizing: border-box;
    border: none;
    border-radius: 2rem;
    padding: 0.75rem 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    color: #242629;
    pointer-events: auto;
    background: transparent;
    z-index: 3;

    &:hover, &:active, &:focus, &:disabled {
      background: saturate(darken(#F5ECDA, 10%), 5%);
    }

    &:disabled {
      cursor: default;
    }
  }

  &__content {
    position: relative;
    flex: 1;
    display: flex;
    width: 300px;
    min-width: 0;
    z-index: 3;

    &-enter-active, &-leave-active {
      transition: all 0.5s ease-in-out;
    }

    &-enter-active {
      .search__button {
        transition-delay: 0.2s;
      }
    }

    &-leave-active {
      transition-delay: 0.3s;
    }

    &-enter, &-leave-to {
      max-width: 0;

      .search__button {
        transform: scale(0);
      }
    }

    &-enter-to, &-leave {
      max-width: 300px;
    }
  }

  &__field {
    background: transparent;
    border: none;
    outline: none;
    padding: 0 0.5rem;
    font-size: 1rem;
    box-sizing: border-box;
    transition: all 0.2s ease-in-out;
    flex: 1;
    width: auto;
    min-width: 0;
    font-family: 'Libre Baskerville', serif;
  }

  &__results {
    position: absolute;
    margin-top: 1rem;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1;
    transform-origin: top center;

    &-enter-active, &-leave-active {
      transition: all 0.5s ease-in-out;
    }

    &-enter-active {
      transition-delay: 0.4s;
    }

    &-enter, &-leave-to {
      transform: translateY(-3.25rem);
      max-height: 0 !important;
    }

    &-enter-to, &-leave {
      transform: translateY(0);
    }

    &-enter-to {
      max-height: 200px !important;
    }
  }
}
</style>
