// Theme helper: puts the "dark" class on <html> and remembers the choice.
// Theme values: 'light', 'dark' or 'system' (follow the operating system).

const STORAGE_KEY = 'theme'
const VALID_THEMES = ['light', 'dark', 'system']

const media =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

// The theme that is currently applied (used when the OS setting changes)
let currentTheme = 'system'

// Read the saved theme from localStorage, falling back to 'system'
export function readStoredTheme() {
  const saved = localStorage.getItem(STORAGE_KEY)
  return VALID_THEMES.includes(saved) ? saved : 'system'
}

// True when the operating system is set to dark mode
export function systemPrefersDark() {
  return !!media?.matches
}

// Add or remove the "dark" class on <html> and tell the browser which scheme is used
function setDarkClass(isDark) {
  const root = document.documentElement
  root.classList.toggle('dark', isDark)
  root.style.colorScheme = isDark ? 'dark' : 'light'
}

// When the OS switches between light and dark, follow it only if the theme is 'system'
media?.addEventListener('change', (event) => {
  if (currentTheme === 'system') setDarkClass(event.matches)
})

// Apply a theme to the page and save it. Unknown values become 'system'.
export function applyTheme(theme = 'system') {
  const next = VALID_THEMES.includes(theme) ? theme : 'system'
  currentTheme = next
  localStorage.setItem(STORAGE_KEY, next)
  setDarkClass(next === 'dark' || (next === 'system' && systemPrefersDark()))
}