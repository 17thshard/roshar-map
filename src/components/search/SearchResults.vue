<template>
  <div class="search-results">
    <Scrollbar class="search-results__scroller" :ops="$store.state.scrollbarOptions">
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
    </Scrollbar>
  </div>
</template>

<script>
import Scrollbar from 'vuescroll/dist/vuescroll-native'
import SearchResult from '@/components/search/SearchResult.vue'

export default {
  name: 'SearchResults',
  components: { SearchResult, Scrollbar },
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

    .__panel {
      min-width: 100%;
      height: auto !important;
    }

    .__view {
      display: flex;
      align-items: stretch;
      width: auto !important;
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
