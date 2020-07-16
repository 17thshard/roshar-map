import Vue from 'vue'
import VueRouter from 'vue-router'
import { loadLanguageAsync } from '@/i18n'
import store from '@/store'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      name: 'root',
      path: '/:locale',
      children: [
        {
          name: 'event',
          path: 'events/:id',
          beforeEnter (to, from, next) {
            const event = store.state.eventMapping[to.params.id]

            if (to.params.id === undefined || event === undefined) {
              next(false)
              return
            }

            store.commit('selectEvent', event)

            next()
          }
        },
        {
          name: 'location',
          path: 'locations/:id',
          beforeEnter (to, from, next) {
            const location = store.state.locationMapping[to.params.id]

            if (to.params.id === undefined || location === undefined) {
              next(false)
              return
            }

            store.commit('unselectEvent')

            next()
          }
        }
      ]
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
  const locale = to.params.locale

  if (locale === undefined) {
    next('/en')
    return
  }

  loadLanguage(locale).then(() => next()).catch(() => next('/en-US'))
})

export { router }
