import { createApp } from 'vue'
import VueDragscroll from 'vue-dragscroll'
import { createGtag } from 'vue-gtag'
import { createPinia } from 'pinia'
import { i18n } from '@/i18n'
import Editor from '@/components/editor/Editor.vue'
import { router } from '@/routes'
import App from './App.vue'

const editor = window.location.hash.includes('editor')

const app = createApp(editor ? Editor : App)

app.use(VueDragscroll)
if (import.meta.env.VUE_APP_GA_ID !== undefined) {
  app.use(createGtag({
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
    },
    router: editor ? undefined : router
  }))
} else {
  // Ensure $gtag is always defined to avoid Vue warnings
  app.config.globalProperties.$gtag = undefined
}

app.use(i18n)
app.use(createPinia())
if (!editor) {
  app.use(router)
}

app.mount('#app')
