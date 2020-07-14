import Vue from 'vue'
import VueRouter from 'vue-router'
import { loadLanguageAsync } from '@/i18n'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/:lang'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const lang = to.params.lang || 'en'

  loadLanguageAsync(lang).then(() => next())
})

export { router }
