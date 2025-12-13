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
if (import.meta.env.VUE_APP_GA_ID !== undefined) {
  Vue.use(
    VueGtag,
    {
      config: {
        id: import.meta.env.VUE_APP_GA_ID,
        params: {
          send_page_view: true,
          debug_mode: !import.meta.env.PROD
        }
      },
      pageTrackerTemplate (to) {
        if (to.name === 'root') {
          return {
            page_title: 'Home Page',
            page_path: to.fullPath
          }
        }

        return {
          page_title: `Details: ${to.name}/${to.params.id}`,
          page_path: to.fullPath
        }
      }
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
