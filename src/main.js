import { createApp } from 'vue'
import VueDragscroll from 'vue-dragscroll'
import { createGtag } from 'vue-gtag'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { i18n } from '@/i18n'
import { router } from '@/routes'
import App from './App.vue'
import './registerServiceWorker'

const app = createApp(App)

app.use(VueDragscroll)
if (import.meta.env.VUE_APP_GA_ID !== undefined) {
  app.use(createGtag({
    config: {
      id: import.meta.env.VUE_APP_GA_ID,
      params: {
        send_page_view: true
      }
    },
    disableScriptLoad: !import.meta.env.PROD,
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
    },
    router
  }))
} else {
  // Ensure $gtag is always defined to avoid Vue warnings
  app.config.globalProperties.$gtag = undefined
}

app.use(i18n)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)

app.mount('#app')
