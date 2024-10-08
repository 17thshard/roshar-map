import Vue from 'vue'
import VueI18n from 'vue-i18n'
import messages from '@/lang/en.lang.json'
import store from '@/store'

Vue.use(VueI18n)

export const i18n = new VueI18n({
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: { en: { ...messages, sourceFile: 'en' } },
  silentFallbackWarn: true
})

const loadedLanguages = ['en', 'en-US'] // our default language that is preloaded

function setI18nLanguage (lang) {
  i18n.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  const textDirection = i18n.t('text-direction')
  document.querySelector('html').setAttribute('dir', textDirection)
  store.commit('setTextDirection', textDirection)
  return lang
}

export function loadLanguageAsync (lang, locale) {
  // If the same language
  if (i18n.locale === locale) {
    return Promise.resolve(setI18nLanguage(locale))
  }

  // If the locale was already loaded
  if (loadedLanguages.includes(locale)) {
    return Promise.resolve(setI18nLanguage(locale))
  }

  // If the language hasn't been loaded yet
  return import(/* webpackChunkName: "lang-[request]" */ '@/lang/' + lang + '.lang.json').then(
    (messages) => {
      messages.default.sourceFile = lang
      i18n.setLocaleMessage(lang, messages.default)
      loadedLanguages.push(lang)
      return setI18nLanguage(locale)
    }
  )
}
