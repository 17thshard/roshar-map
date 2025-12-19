import { createApp, configureCompat } from '@vue/compat'
import VueDragscroll from 'vue-dragscroll'
import VueGtag from 'vue-gtag'
import { i18n } from '@/i18n'
import Editor from '@/components/editor/Editor.vue'
import { router } from '@/routes'
import store from './store'
import App from './App.vue'

const editor = window.location.hash.includes('editor')

// Configure compat mode
configureCompat({
  MODE: 2, // Vue 2 compat mode
  GLOBAL_MOUNT: false,
  GLOBAL_EXTEND: false,
  GLOBAL_PROTOTYPE: false,
  GLOBAL_SET: false,
  GLOBAL_DELETE: false,
  GLOBAL_OBSERVABLE: false,
  CONFIG_SILENT: false,
  CONFIG_DEVTOOLS: false,
  CONFIG_KEY_CODES: false,
  CONFIG_PRODUCTION_TIP: false
})

const app = createApp(editor ? Editor : App)

app.config.productionTip = false

app.use(VueDragscroll)
if (import.meta.env.VUE_APP_GA_ID !== undefined) {
  app.use(
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

app.use(i18n)
app.use(store)
if (!editor) {
  app.use(router)
}

app.mount('#app')
