import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import VueGtag from 'vue-gtag'
import App from './App.vue'
import store from './store'
import { i18n } from '@/i18n'
import { router } from '@/routes'
import './registerServiceWorker'

Vue.config.productionTip = false

Vue.use(VueDragscroll)
if (process.env.VUE_APP_GA_ID !== undefined) {
  Vue.use(VueGtag,
    {
      config: { id: process.env.VUE_APP_GA_ID },
      disableScriptLoad: process.env.NODE_ENV !== 'production'
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
