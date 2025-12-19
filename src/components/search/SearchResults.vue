<template>
  <div class="search-results">
    <div class="search-results__scroller">
      <ul class="search-results__list">
        <li v-if="loading" class="search-results__placeholder">
          {{ $t('ui.search.loading') }}
        </li>
        <li v-else-if="emptyQuery" class="search-results__placeholder">
          {{ $t('ui.search.empty-query') }}
        </li>
        <li v-else-if="results.length === 0" class="search-results__placeholder">
          {{ $t('ui.search.no-results') }}
        </li>
        <li v-for="result in results" :key="result">
          <SearchResult :entry="result" @use="$emit('result-use', result)" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import SearchResult from '@/components/search/SearchResult.vue'

export default {
  name: 'SearchResults',
  components: { SearchResult },
  props: {
    results: {
      type: Array,
      required: true
    },
    loading: Boolean,
    emptyQuery: Boolean
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
    overflow-y: auto;
    overflow-x: hidden;

    // Custom scrollbar styling
    scrollbar-width: thin;
    scrollbar-color: rgba(#482d00, 0.5) transparent;

    &::-webkit-scrollbar {
      width: 0.5rem;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(#482d00, 0.5);
      border-radius: 0.25rem;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: rgba(#482d00, 0.7);
    }

    [dir=rtl] & {
      direction: rtl;
    }
  }

  &__list {
    padding: 0;
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
