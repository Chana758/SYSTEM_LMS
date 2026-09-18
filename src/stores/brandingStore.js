import { defineStore } from 'pinia'
import { settingService } from '@/features/settings/services/settingsService'

// Fallback defaults — used until the API responds, or if it fails
// (e.g. offline first paint on the Login page).
const DEFAULTS = {
  logoUrl: null,
  siteName: 'SMART',
  siteNameAccent: 'NEXUS',
  siteTagline: 'SMART SYSTEM LMS',
}

export const useBrandingStore = defineStore('branding', {
  state: () => ({
    ...DEFAULTS,
    loaded: false,
  }),

  actions: {
    /**
     * Called once on app boot (main.js), and also safe to call again
     * (e.g. right after an admin saves new branding) to refresh.
     */
    async init() {
      try {
        const { data } = await settingService.getBranding()
        this._applyBranding(data)
      } catch (error) {
        // Keep defaults — never block the login/register screen.
      } finally {
        this.loaded = true
      }
    },

    /**
     * Admin-only. formData must be a FormData instance containing any
     * combination of: logo (File), site_name, site_name_accent, site_tagline.
     */
    async update(formData) {
      const { data } = await settingService.updateBranding(formData)
      this._applyBranding(data.branding)
      return data
    },

    _applyBranding(payload) {
      this.logoUrl = payload.logo_url ?? null
      this.siteName = payload.site_name || DEFAULTS.siteName
      this.siteNameAccent = payload.site_name_accent || DEFAULTS.siteNameAccent
      this.siteTagline = payload.site_tagline || DEFAULTS.siteTagline
    },
  },
})