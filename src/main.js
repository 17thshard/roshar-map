import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import VueGtag from 'vue-gtag'
import { i18n } from '@/i18n'
import { router } from '@/routes'
import App from './App.vue'
import store from './store'
import './registerServiceWorker'

Vue.config.productionTip = false

Vue.use(VueDragscroll)
if (process.env.VUE_APP_GA_ID !== undefined) {
  Vue.use(VueGtag,
    {
      config: {
        id: process.env.VUE_APP_GA_ID,
        params: {
          send_page_view: true
        }
      },
      disableScriptLoad: process.env.NODE_ENV !== 'production',
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
    router
  )
}

new Vue({
  i18n,
  store,
  router,
  render: h => h(App)
}).$mount('#app')
