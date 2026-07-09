import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: { welcome: 'Welcome' },
    km: { welcome: 'សូមស្វាគមន៍' }
  }
})

export default i18n