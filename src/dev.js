import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import App from './App.vue'
import store from './store'
import { i18n } from '@/i18n'
import Editor from '@/components/editor/Editor.vue'
import { router } from '@/routes'

Vue.config.productionTip = false

Vue.use(VueDragscroll)

const editor = window.location.hash.includes('editor')

new Vue({
  i18n,
  store,
  router: editor ? undefined : router,
  render: h => h(editor ? Editor : App)
}).$mount('#app')
