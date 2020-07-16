import Vue from 'vue'
import VueRouter from 'vue-router'
import { loadLanguageAsync } from '@/i18n'
import store from '@/store'

Vue.use(VueRouter)

const detailRoutes = [
  {
    name: 'events',
    specialAction: event => store.commit('selectEvent', event)
  },
  {
    name: 'locations',
    specialAction: () => store.commit('unselectEvent')
  },
  {
    name: 'characters',
    specialAction: () => store.commit('unselectEvent')
  },
  {
    name: 'misc',
    specialAction: () => store.commit('unselectEvent')
  }
]

const router = new VueRouter({
  routes: [
    {
      name: 'root',
      path: '/:locale',
      children: detailRoutes.map(({ name, path, specialAction }) => ({
        name,
        path: `${name}/:id`,
        meta: {
          details: true
        },
        beforeEnter (to, from, next) {
          const entry = store.state.mappings[name][to.params.id]

          if (to.params.id === undefined || entry === undefined) {
            next(false)
            return
          }

          specialAction(entry)
          next()
        }
      }))
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
