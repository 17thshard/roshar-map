import { createRouter, createWebHistory } from 'vue-router'
import { i18n, loadLanguageAsync } from '@/i18n'
import { useMainStore } from '@/stores/main'
import Map from '@/components/map/Map.vue'

const EmptyComponent = {
  render: () => null
}

const detailRoutes = [
  {
    name: 'events',
    specialAction: event => useMainStore().selectEvent(event)
  },
  {
    name: 'locations',
    specialAction: () => useMainStore().unselectEvent()
  },
  {
    name: 'characters',
    specialAction: () => useMainStore().unselectEvent()
  },
  {
    name: 'misc',
    specialAction: () => useMainStore().unselectEvent()
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: 'root',
      path: '/:locale',
      component: Map,
      children: detailRoutes.map(({ name, specialAction }) => ({
        name,
        path: `${name}/:id`,
        component: EmptyComponent,
        meta: {
          details: true
        },
        beforeEnter (to, from, next) {
          const store = useMainStore()
          const entry = store.mappings[name][to.params.id]

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

  if (oldLocale !== undefined) {
    const oldTextureLocale = i18n.global.getLocaleMessage(oldLocale)?.['texture-locale']
    const newTextureLocale = i18n.global.getLocaleMessage(newLocale)?.['texture-locale']

    if (oldTextureLocale !== newTextureLocale) {
      location.reload()
    }
  }
})

router.afterEach((to) => {
  let pageName = i18n.global.t('name')

  if (to.name !== 'root') {
    pageName = i18n.global.t(`${to.name}.${to.params.id}.name`)
  }

  document.querySelector('title').innerHTML = i18n.global.t('title', { page: pageName })
})

/**
 * The Vue Router instance.
 */
export { router }
