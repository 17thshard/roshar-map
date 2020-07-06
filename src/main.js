import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import App from './App.vue'
import store from './store'
import Editor from '@/components/editor/Editor.vue'

Vue.config.productionTip = false

Vue.use(VueDragscroll)

const editor = window.location.hash.includes('editor')

new Vue({
  store,
  render: h => h(editor ? Editor : App)
}).$mount('#app')
