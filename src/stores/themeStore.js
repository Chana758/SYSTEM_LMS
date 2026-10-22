import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { applyTheme, readStoredTheme, systemPrefersDark } from '@/utils/applyTheme'

// One place that knows the current theme. The Navbar button and the
// Preferences page both read and change it here, so they always agree.
export const useThemeStore = defineStore('theme', () => {
  // 'light', 'dark' or 'system'
  const theme = ref(readStoredTheme())

  // Whether the operating system is currently in dark mode (updates live)
  const systemDark = ref(systemPrefersDark())
  if (typeof window !== 'undefined' && window.matchMedia) {
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (event) => {
        systemDark.value = event.matches
      })
  }

  // True when the page is really dark (explicit dark, or 'system' on a dark OS)
  const isDark = computed(
    () => theme.value === 'dark' || (theme.value === 'system' && systemDark.value)
  )

  // Change the theme, apply it to <html>, and remember it
  function setTheme(next) {
    if (!['light', 'dark', 'system'].includes(next)) return
    theme.value = next
    applyTheme(next)
  }

  // Flip between light and dark (used by the Navbar button)
  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
})