<template>
  <div
    ref="root"
    data-tutorial-id="search"
    :class="['search', { 'search--open': open, 'search--closing': closing }]"
    :style="{ '--left': `${left}px`, '--right': `${right}px` }"
    @animationend="onAnimationEnd"
  >
    <button :disabled="open" class="search__button" :title="$t('ui.search.title')" @click="$emit('open')">
      <SearchIcon size="1x" />
    </button>
    <transition name="search__content">
      <div v-if="open" class="search__content">
        <input
          key="field"
          ref="field"
          v-model="query"
          type="search"
          class="search__field"
          :placeholder="$t('ui.search.prompt')"
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
        @result-use="onResultUse"
      />
    </transition>
  </div>
</template>

<script>
import { SearchIcon, XIcon } from 'vue-feather-icons'
import SearchResults from '@/components/search/SearchResults.vue'
import { debounce } from '@/utils'

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
      fieldFocused: false,
      left: 0,
      right: 0,
      closing: false
    }
  },
  watch: {
    async open (value) {
      if (value) {
        const rect = this.$refs.root.getBoundingClientRect()
        this.left = rect.left
        this.right = window.innerWidth - rect.right
        this.closing = false
        this.query = ''
        this.$nextTick(() => {
          this.$refs.field.focus()
        })
        await this.$store.dispatch('search/loadIndex', this.$t('sourceFile'))
        this.loadingIndex = false
        this.search(this.query)
      } else {
        this.closing = true
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

      if (this.$gtag) {
        this.track(this.$gtag, query)
      }
    },
    onResultUse (result) {
      if (this.$gtag) {
        this.$gtag.event('view_search_results', { event_category: 'engagement', search_term: this.query, search_result: result })
      }
      this.$emit('close')
    },
    onAnimationEnd (event) {
      if (event.animationName === 'search--closing') {
        this.closing = false
      }
    },
    track: debounce((gtag, query) => gtag.event('search', { event_category: 'engagement', search_term: query }))
  }
}
</script>

<style lang="scss">
.search {
  position: relative;
  display: flex;
  z-index: 60;

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
    z-index: 62;
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
    z-index: 63;

    &:hover, &:active, &:focus, &:disabled {
      background: color.adjust(color.adjust(#F5ECDA, $lightness: -10%), $saturation: 5%);
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
    z-index: 63;

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

    // Hide browser's native search clear button
    &::-webkit-search-cancel-button {
      -webkit-appearance: none;
      appearance: none;
    }

    &::-ms-clear {
      display: none;
    }
  }

  &__results {
    position: absolute;
    margin-top: 1rem;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 61;
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

  @media (max-width: 640px) {
    &:after {
      content: '';
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.5);
      transition: opacity 0.5s ease-in-out;
      opacity: 0;
      pointer-events: none;
    }

    &--open, &--closing {
      position: fixed;
      left: 2rem;
      right: 2rem;
      top: 2rem;
      z-index: 70;
      animation: 0.5s ease-in-out search--opening;

      &:after {
        pointer-events: auto;
        opacity: 1;
      }
    }

    &--closing {
      animation: 0.5s ease-in-out 0.3s search--closing;

      &:after {
        opacity: 0;
      }
    }

    &__content {
      transition: none;
      max-width: 100% !important;

      &-enter-active {
        .search__button {
          transition-delay: 0.4s;
        }
      }
    }

    @keyframes search--opening {
      from {
        left: var(--left);
        right: var(--right);
      }
      to {
        left: 2rem;
        right: 2rem;
      }
    }

    @keyframes search--closing {
      from {
        left: 2rem;
        right: 2rem;
      }
      to {
        left: var(--left);
        right: var(--right);
      }
    }
  }
}
</style>
