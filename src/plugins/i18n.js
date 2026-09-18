import { createI18n } from 'vue-i18n'

import common_en from '@/locales/en/common.json'
import common_km from '@/locales/km/common.json'
import auth_en from '@/locales/en/auth.json'
import auth_km from '@/locales/km/auth.json'
import catalog_en from '@/locales/en/catalog.json'
import catalog_km from '@/locales/km/catalog.json'
import circulation_en from '@/locales/en/circulation.json'
import circulation_km from '@/locales/km/circulation.json'
import dashboard_en from '@/locales/en/dashboard.json'
import dashboard_km from '@/locales/km/dashboard.json'
import members_en from '@/locales/en/members.json'
import members_km from '@/locales/km/members.json'
import fines_en from '@/locales/en/fines.json'
import fines_km from '@/locales/km/fines.json'
import reservation_en from '@/locales/en/reservation.json'
import reservation_km from '@/locales/km/reservation.json'
import notifications_en from '@/locales/en/notifications.json'
import notifications_km from '@/locales/km/notifications.json'
import digitalLibrary_en from '@/locales/en/digitallibrary.json'
import digitalLibrary_km from '@/locales/km/digitallibrary.json'
import reports_en from '@/locales/en/reports.json'
import reports_km from '@/locales/km/reports.json'
import settings_en from '@/locales/en/settings.json'
import settings_km from '@/locales/km/settings.json'
import scanner_en from '@/locales/en/scanner.json'
import scanner_km from '@/locales/km/scanner.json'
import staff_en from '@/locales/en/staff.json'
import staff_km from '@/locales/km/staff.json'
import sidebar_en from '@/locales/en/sidebar.json'
import sidebar_km from '@/locales/km/sidebar.json'
import chatbot_en from '@/locales/en/chatbot.json'
import chatbot_km from '@/locales/km/chatbot.json'
import recommendation_en from '@/locales/en/recommendation.json'
import recommendation_km from '@/locales/km/recommendation.json'

const messages = {
  en: {
    common: common_en,
    auth: auth_en,
    catalog: catalog_en,
    circulation: circulation_en,
    dashboard: dashboard_en,
    members: members_en,
    fines: fines_en,
    reservation: reservation_en,
    notifications: notifications_en,
    digitalLibrary: digitalLibrary_en,
    reports: reports_en,
    settings: settings_en,
    scanner: scanner_en,
    staff: staff_en,
    sidebar: sidebar_en,
    chatbot: chatbot_en,
    recommendation: recommendation_en,
  },
  km: {
    common: common_km,
    auth: auth_km,
    catalog: catalog_km,
    circulation: circulation_km,
    dashboard: dashboard_km,
    members: members_km,
    fines: fines_km,
    reservation: reservation_km,
    notifications: notifications_km,
    digitalLibrary: digitalLibrary_km,
    reports: reports_km,
    settings: settings_km,
    scanner: scanner_km,
    staff: staff_km,
    sidebar: sidebar_km,
    chatbot: chatbot_km,
    recommendation: recommendation_km,
  },
}

const i18n = createI18n({
  legacy: false, // Required for the Composition API
  globalInjection: true, // Allows using $t directly in templates without importing
  locale: localStorage.getItem('locale') || 'km',
  fallbackLocale: 'en',
  messages,
})

export default i18n