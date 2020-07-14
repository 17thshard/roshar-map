import Vue from 'vue'
import VueRouter from 'vue-router'
import { loadLanguageAsync } from '@/i18n'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/:locale'
    }
  ]
})

async function loadLanguage (locale) {
  const parts = locale.split('-', 3)

  for (let i = 3; i > 0; i--) {
    try {
      await loadLanguageAsync(parts.slice(0, i).join('-'), locale)

      return
    } catch {
      // Only fail on the very last try
    }
  }

  throw new Error('Could not find any locale')
}

router.beforeEach((to, from, next) => {
  const locale = to.params.locale || 'en'

  loadLanguage(locale).then(() => next()).catch(() => next('/en-US'))
})

export { router }
