export default {
  namespaced: true,
  state: () => ({ loadedIndices: {}, loadingIndices: {} }),
  mutations: {
    addIndex (state, { lang, index }) {
      if (state.loadedIndices[lang] !== undefined) {
        return
      }

      state.loadedIndices[lang] = index
    },
    markInProgress (state, lang) {
      state.loadingIndices[lang] = true
    }
  },
  actions: {
    async loadIndex ({ state, commit }, lang) {
      if (state.loadedIndices[lang] !== undefined || state.loadingIndices[lang] === true) {
        return
      }

      commit('markInProgress', lang)

      const lunr = (await import('lunr')).default
      const stemmerSupport = (await import('lunr-languages/lunr.stemmer.support')).default
      stemmerSupport(lunr)
      const data = (await import(/* webpackChunkName: "index-[request]" */ 'search-index-loader.js!@/lang/' + lang + '.lang.json')).default
      try {
        const langSupport = (await import('@/lang/search/' + lang)).default
        await langSupport(lunr)
      } catch (e) {
        if (e.code !== 'MODULE_NOT_FOUND') {
          throw e
        }
      }

      commit('addIndex', { lang, index: lunr.Index.load(data) })
    }
  }
}
