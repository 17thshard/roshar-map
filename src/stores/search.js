import { defineStore } from 'pinia'

const indexModules = import.meta.glob('/build/generated/search-index/*.json')
const langSupportModules = import.meta.glob('../lang/search/*.js')

/**
 * Pinia store for handling search functionality.
 */
export const useSearchStore = defineStore('search', {
  /**
   * State of the search store.
   * @returns {object} - The initial state.
   */
  state: () => ({
    loadedIndices: {},
    loadingIndices: {}
  }),
  actions: {
    /**
     * Adds a loaded search index to the store.
     * @param {object} payload - The payload.
     * @param {string} payload.lang - The language code.
     * @param {object} payload.index - The loaded Lunr index.
     */
    addIndex ({ lang, index }) {
      if (this.loadedIndices[lang] !== undefined) {
        return
      }

      this.loadedIndices[lang] = index
    },
    /**
     * Marks an index as currently loading.
     * @param {string} lang - The language code.
     */
    markInProgress (lang) {
      this.loadingIndices[lang] = true
    },
    /**
     * Loads the search index for a specific language.
     * @param {string} lang - The language code.
     * @returns {Promise<void>}
     */
    async loadIndex (lang) {
      if (this.loadedIndices[lang] !== undefined || this.loadingIndices[lang] === true) {
        return
      }

      this.markInProgress(lang)

      const lunr = (await import('lunr')).default
      const stemmerSupport = (await import('lunr-languages/lunr.stemmer.support')).default
      stemmerSupport(lunr)
      const loader = indexModules[`/build/generated/search-index/${lang}.json`]
      if (!loader) {
        throw new Error(
          `Missing generated search index for '${lang}'. ` +
          `Run: yarn dev (or yarn build) to generate it.`
        )
      }
      const data = (await loader()).default
      try {
        const langLoader = langSupportModules[`../lang/search/${lang}.js`]
        if (langLoader) {
          const langSupport = (await langLoader()).default
          await langSupport(lunr)
        } else {
          throw Object.assign(new Error('MODULE_NOT_FOUND'), { code: 'MODULE_NOT_FOUND' })
        }
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
          throw e
        }
      }

      this.addIndex({ lang, index: lunr.Index.load(data) })
    }
  }
})

