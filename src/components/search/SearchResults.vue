<template>
  <div class="search-results">
    <CustomScrollbar
      class="search-results__scroller"
      :class="{
        'search-results__scroller--gradient': hasScrollbar,
        'search-results__scroller--bottom': scrolledToBottom
      }"
      @updated="onScrollbarUpdated"
      @scroll="onScroll"
    >
      <ul class="search-results__list">
        <li
          v-if="loading"
          class="search-results__placeholder"
        >
          {{ $t('ui.search.loading') }}
        </li>
        <li
          v-else-if="emptyQuery"
          class="search-results__placeholder"
        >
          {{ $t('ui.search.empty-query') }}
        </li>
        <li
          v-else-if="results.length === 0"
          class="search-results__placeholder"
        >
          {{ $t('ui.search.no-results') }}
        </li>
        <li
          v-for="result in results"
          :key="result"
        >
          <SearchResult
            :entry="result"
            @use="$emit('result-use', result)"
          />
        </li>
      </ul>
    </CustomScrollbar>
  </div>
</template>

<script>
import SearchResult from '@/components/search/SearchResult.vue'
import CustomScrollbar from '@/components/CustomScrollbar.vue'

export default {
  name: 'SearchResults',
  components: { SearchResult, CustomScrollbar },
  props: {
    results: {
      type: Array,
      required: true
    },
    loading: Boolean,
    emptyQuery: Boolean
  },
  emits: ['result-use'],
  data() {
    return {
      hasScrollbar: false,
      scrolledToBottom: false
    }
  },
  methods: {
    onScrollbarUpdated(instance) {
      if (instance && instance.elements) {
        this.updateScrollInfo(instance.elements().viewport);
      }
    },
    onScroll(event) {
      this.updateScrollInfo(event.target || event.srcElement);
    },
    updateScrollInfo(target) {
      if (!target) return;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const maxScroll = scrollHeight - clientHeight;

      this.hasScrollbar = maxScroll > 0;

      if (maxScroll <= 0) {
        this.scrolledToBottom = true;
        return;
      }

      this.scrolledToBottom = (maxScroll - scrollTop) / maxScroll < 0.05;
    }
  }
}
</script>

<style lang="scss">
.search-results {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-sizing: border-box;
  padding: 1rem;
  width: 100%;
  border-radius: 1.25rem;
  max-height: calc(min(600px, 100vh - 7rem));
  overflow: hidden;
  background: #F5ECDA url(../../assets/paper.png);
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.5);

  &__scroller {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: stretch;
    min-height: 0;
    flex: 1;
    width: 100%;

    &--gradient {
      &:after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 60px;
        z-index: 62;
        pointer-events: none;
        transition: opacity 0.5s ease-in-out;
        opacity: 1;
        background: linear-gradient(0deg, rgba(#F5ECDA, 1.0) 0, rgba(#F5ECDA, 0) 100%);
        border-bottom: 0rem solid #F5ECDA;
      }

      &.search-results__scroller--bottom:after {
        opacity: 0;
      }
    }

    [dir=rtl] & {
      direction: rtl;
    }
  }

  &__list {
    padding: 0 0 0 0;
    margin: 0;
    list-style-type: none;
    width: 100%;

    li {
      width: 100%;
    }
  }

  &__placeholder {
    text-align: center;
  }
}
</style>
