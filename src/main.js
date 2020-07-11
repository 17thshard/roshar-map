import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import VueI18n from 'vue-i18n'
import App from './App.vue'
import store from './store'
import Editor from '@/components/editor/Editor.vue'

Vue.config.productionTip = false

Vue.use(VueDragscroll)
Vue.use(VueI18n)

const editor = window.location.hash.includes('editor')

const messages = {
  en: {
    tagCategories: {
      tags: 'Tags',
      characters: 'Characters',
      books: 'Books'
    },
    tags: {
      general: 'General',
      dalinar: 'Dalinar',
      kaladin: 'Kaladin',
      shallan: 'Shallan',
      wok: 'The Way of Kings',
      wor: 'Words of Radiance',
      ob: 'Oathbringer',
      ed: 'Edgedancer',
      row: 'Rhythm of War'
    }
  }
}

const i18n = new VueI18n({ locale: 'en', fallbackLocale: 'en', messages })

new Vue({
  i18n,
  store,
  render: h => h(editor ? Editor : App)
}).$mount('#app')
