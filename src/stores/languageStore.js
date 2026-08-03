import { defineStore } from 'pinia'
import i18n from '@/plugins/i18n'

export const useLanguageStore = defineStore('language', {
  state: () => ({
    locale: localStorage.getItem('locale') || 'km',
  }),

  actions: {
    setLocale(locale) {
      if (!['en', 'km'].includes(locale)) return

      this.locale = locale
      i18n.global.locale.value = locale
      localStorage.setItem('locale', locale)

      document.documentElement.lang = locale
      document.documentElement.setAttribute(
        'dir',
        'ltr' // Both Khmer and English use left-to-right (LTR) text direction.
      )
    },

    toggleLocale() {
      this.setLocale(this.locale === 'km' ? 'en' : 'km')
    },

    init() {
      // Called when the app is mounted to ensure the correct language
      // is applied from the initial page load.
      document.documentElement.lang = this.locale
    },
  },
})