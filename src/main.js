import Vue from 'vue'
import VueDragscroll from 'vue-dragscroll'
import App from './App.vue'
import store from './store'

Vue.config.productionTip = false

Vue.use(VueDragscroll)

new Vue({
  store,
  render: h => h(App)
}).$mount('#app')
