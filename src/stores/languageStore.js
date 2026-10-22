import { defineStore } from 'pinia'
import i18n from '@/plugins/i18n'

const SUPPORTED_LOCALES = ['en', 'km']
const DEFAULT_LOCALE = 'km'

function readStoredLocale() {
  const saved = localStorage.getItem('locale')
  return SUPPORTED_LOCALES.includes(saved) ? saved : DEFAULT_LOCALE
}

// Works for legacy mode (string) and composition mode (ref)
function applyToI18n(locale) {
  const current = i18n.global.locale
  if (typeof current === 'string') {
    if (current !== locale) i18n.global.locale = locale
  } else if (current.value !== locale) {
    current.value = locale
  }
}

function applyToDocument(locale) {
  document.documentElement.lang = locale
  document.documentElement.setAttribute('dir', 'ltr')
}

export const useLanguageStore = defineStore('language', {
  state: () => ({
    locale: readStoredLocale(),
  }),

  actions: {
    setLocale(locale) {
      if (!SUPPORTED_LOCALES.includes(locale)) return
      if (locale === this.locale) return // nothing to do

      this.locale = locale
      applyToI18n(locale)
      localStorage.setItem('locale', locale)
      applyToDocument(locale)
    },

    toggleLocale() {
      this.setLocale(this.locale === 'km' ? 'en' : 'km')
    },

    init() {
      applyToI18n(this.locale)
      applyToDocument(this.locale)
    },
  },
})