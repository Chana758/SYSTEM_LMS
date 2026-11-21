import { defineStore } from 'pinia'
import apiClient from '@/api/axios'

// Shared ៛ / $ choice (top bar switch). Amounts are stored in Riel;
// the screen converts them with the rate the admin sets in System Settings.
const KEY = 'currency'
const read = () => (localStorage.getItem(KEY) === 'USD' ? 'USD' : localStorage.getItem(KEY) === 'KHR' ? 'KHR' : null)

export const useCurrencyStore = defineStore('currency', {
  state: () => ({
    currency: read() || 'KHR',
    rate: Number(localStorage.getItem('exchange_rate')) || 4100, // Riel per 1 USD
    loaded: false,
  }),

  getters: {
    isUsd: (s) => s.currency === 'USD',
  },

  actions: {
    set(currency) {
      this.currency = currency === 'USD' ? 'USD' : 'KHR'
      localStorage.setItem(KEY, this.currency)
    },
    toggle() {
      this.set(this.isUsd ? 'KHR' : 'USD')
    },
    // Rate + school default (used only until the user picks a currency themselves)
    async loadConfig() {
      try {
        const { data } = await apiClient.get('/payment-config')
        this.rate = Number(data.exchange_rate) || this.rate
        localStorage.setItem('exchange_rate', String(this.rate))
        if (!read() && data.default_currency) this.currency = data.default_currency
      } catch {
        // keep the last known rate
      } finally {
        this.loaded = true
      }
    },
  },
})
