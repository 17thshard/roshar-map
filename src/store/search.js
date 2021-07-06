import { Index } from 'lunr'

export default {
  namespaced: true,
  state: () => ({ loadedIndices: {} }),
  mutations: {
    addIndex (state, { lang, index }) {
      if (state.loadedIndices[lang] !== undefined) {
        return
      }

      state.loadedIndices[lang] = index
    }
  },
  actions: {
    async loadIndex ({ state, commit }, lang) {
      if (state.loadedIndices[lang] !== undefined) {
        return
      }

      const data = await import(/* webpackChunkName: "index-[request]" */ 'search-index-loader.js!@/lang/' + lang + '.lang.json')
      commit('addIndex', { lang, index: Index.load(data.default) })
    }
  }
}
