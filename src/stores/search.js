import { defineStore } from 'pinia'

const indexModules = import.meta.glob('/build/generated/search-index/*.json')
const langSupportModules = import.meta.glob('../lang/search/*.js')

export const useSearchStore = defineStore('search', {
  state: () => ({
    loadedIndices: {},
    loadingIndices: {}
  }),
  actions: {
    addIndex ({ lang, index }) {
      if (this.loadedIndices[lang] !== undefined) {
        return
      }

      this.loadedIndices[lang] = index
    },
    markInProgress (lang) {
      this.loadingIndices[lang] = true
    },
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

