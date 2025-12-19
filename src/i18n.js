import { createI18n } from 'vue-i18n'
import messages from '@generated/lang/en.lang.json'
import store from '@/store'

export const i18n = createI18n({
  legacy: true, // Use legacy mode for Vue 2 compat
  locale: 'en-US',
  fallbackLocale: 'en-US',
  messages: { en: { ...messages, sourceFile: 'en' } },
  silentFallbackWarn: true
})

const loadedLanguages = ['en', 'en-US'] // our default language that is preloaded
const generatedLangModules = import.meta.glob('/build/generated/lang/*.lang.json')

function setI18nLanguage (lang) {
  i18n.global.locale = lang
  document.querySelector('html').setAttribute('lang', lang)
  const textDirection = i18n.global.t('text-direction')
  document.querySelector('html').setAttribute('dir', textDirection)
  store.commit('setTextDirection', textDirection)
  return lang
}

export function loadLanguageAsync (lang, locale) {
  // If the same language
  if (i18n.global.locale === locale) {
    return Promise.resolve(setI18nLanguage(locale))
  }

  // If the locale was already loaded
  if (loadedLanguages.includes(locale)) {
    return Promise.resolve(setI18nLanguage(locale))
  }

  // If the language hasn't been loaded yet
  const loader = generatedLangModules[`/build/generated/lang/${lang}.lang.json`]
  if (!loader) {
    return Promise.reject(new Error(`Unknown language pack: ${lang}`))
  }

  return loader().then((mod) => {
    mod.default.sourceFile = lang
    i18n.global.setLocaleMessage(lang, mod.default)
    loadedLanguages.push(lang)
    return setI18nLanguage(locale)
  })
}
