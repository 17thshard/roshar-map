import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import VueGtag from 'vue-gtag'
import { i18n } from '@/i18n'
import Editor from '@/components/editor/Editor.vue'
import { router } from '@/routes'
import store from './store'
import App from './App.vue'

const editor = window.location.hash.includes('editor')
Vue.config.productionTip = false

Vue.use(VueDragscroll)
if (process.env.VUE_APP_GA_ID !== undefined) {
  Vue.use(VueGtag,
    {
      config: { id: process.env.VUE_APP_GA_ID },
      disableScriptLoad: process.env.NODE_ENV !== 'production'
    },
    editor ? undefined : router
  )
}

new Vue({
  i18n,
  store,
  router: editor ? undefined : router,
  render: h => h(editor ? Editor : App)
}).$mount('#app')
