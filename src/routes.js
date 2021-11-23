import Vue from 'vue'
import VueRouter from 'vue-router'
import { i18n, loadLanguageAsync } from '@/i18n'
import store from '@/store'
import Map from '@/components/map/Map.vue'

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
      component: Map,
      children: detailRoutes.map(({ name, specialAction }) => ({
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

router.beforeEach(async (to, from, next) => {
  const locale = to.params.locale

  if (locale === undefined) {
    const userLocale = navigator.languages !== undefined ? navigator.languages[0] : navigator.language
    next(`/${userLocale}`)
    return
  }

  try {
    await loadLanguageAsync(locale, locale)
  } catch {
    next({ name: to.name, params: { ...to.params, locale: 'en-US' }, replace: true })
    return
  }

  next()
})

router.afterEach((to, from) => {
  const oldLocale = from.params.locale
  const newLocale = to.params.locale

  if (oldLocale !== undefined && i18n.t('texture-locale', newLocale) !== i18n.t('texture-locale', oldLocale)) {
    location.reload()
  }
})

router.afterEach((to) => {
  let pageName = i18n.t('name')

  if (to.name !== 'root') {
    pageName = i18n.t(`${to.name}.${to.params.id}.name`)
  }

  document.querySelector('title').innerHTML = i18n.t('title', { page: pageName })
})

export { router }
