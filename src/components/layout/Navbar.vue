<template>
  <header
    class="h-16 lg:h-[72px] pl-3.5 pr-2.5 sm:px-6 flex items-center gap-2 sm:gap-4 sticky top-0 z-20 w-full shadow-sm transition-colors duration-300
           border-b border-slate-200 dark:border-white/10 sm:border-b-2 sm:border-amber-400/70 sm:dark:border-amber-400/70
           bg-white dark:bg-slate-900 sm:bg-green-900 sm:dark:bg-slate-900"
  >
    <!-- Burger: hidden for members on phone/tablet (menu lives in the bottom nav) -->
    <button
      @click="$emit('toggle-sidebar')"
      class="w-9 h-9 sm:w-10 sm:h-10 items-center justify-center rounded-xl border transition flex-shrink-0 cursor-pointer
             text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200
             dark:text-white dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/15
             sm:text-white sm:bg-white/10 sm:border-white/10 sm:hover:bg-amber-400/20
             sm:dark:border-white/10 sm:dark:hover:bg-amber-400/20"
      :class="isMember ? 'hidden lg:flex' : 'flex'"
      aria-label="Menu"
    >
      <Bars3Icon class="w-5 h-5 sm:w-6 sm:h-6" />
    </button>

    <!-- Member on phone/tablet: plain profile avatar takes the burger's place -->
    <router-link
      v-if="isMember"
      to="/my-profile"
      class="lg:hidden flex-shrink-0 rounded-full active:scale-95 transition"
      aria-label="Profile"
    >
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt=""
        class="block w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover object-center
               ring-1 ring-slate-200 dark:ring-white/15"
      />
      <div
        v-else
        class="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white
               text-sm font-extrabold flex items-center justify-center"
      >
        {{ initials }}
      </div>
    </router-link>

    <!-- Demo badge (only visible for demo accounts) -->
    <div class="flex-1 min-w-0 flex items-center">
      <DemoBadge />
    </div>

    <div class="flex items-center gap-1.5 sm:gap-3 min-w-0">

      <!-- Light / dark toggle: shows the icon of the current mode -->
      <button
        @click="toggleTheme"
        class="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full sm:rounded-xl border active:scale-95 sm:active:scale-100 transition cursor-pointer flex-shrink-0
               text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200
               dark:text-white dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/15
               sm:text-white sm:bg-white/10 sm:border-white/10 sm:hover:bg-amber-400/20 sm:hover:text-amber-300
               sm:dark:border-white/10 sm:dark:hover:bg-amber-400/20"
        :title="t('common.header.toggleTheme')"
        :aria-label="t('common.header.toggleTheme')"
      >
        <MoonIcon v-if="isDark" class="w-5 h-5" />
        <SunIcon v-else class="w-5 h-5" />
      </button>

      <!-- Language (phones): shows the language you will switch TO -->
      <button
        @click="toggleLocale"
        class="sm:hidden h-9 pl-2.5 pr-3 flex items-center gap-1.5 rounded-full border text-[11px] font-bold active:scale-95 flex-shrink-0 cursor-pointer transition
               text-slate-700 bg-slate-100 border-slate-200 hover:bg-slate-200
               dark:text-white dark:bg-white/10 dark:border-white/20 dark:hover:bg-white/15"
        :title="nextLanguage.label"
        :aria-label="nextLanguage.label"
      >
        <span class="text-base leading-none">{{ nextLanguage.flag }}</span>
        <span class="tracking-wider uppercase text-green-800 dark:text-amber-300">{{ nextLanguage.shortLabel }}</span>
      </button>

      <!-- Language: both options on tablets/desktop -->
      <div class="hidden sm:flex items-center bg-black/25 backdrop-blur-md rounded-xl p-1 border border-white/15 shadow-inner flex-shrink-0">
        <button
          v-for="option in languageOptions"
          :key="option.code"
          @click="languageStore.setLocale(option.code)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer"
          :class="languageStore.locale === option.code
            ? 'bg-amber-400 text-green-950 shadow-md scale-105'
            : 'text-white/70 hover:text-white hover:bg-white/10'"
          :title="option.label"
          :aria-label="option.label"
        >
          <span class="text-sm leading-none">{{ option.flag }}</span>
          <span class="tracking-wider uppercase">{{ option.shortLabel }}</span>
        </button>
      </div>

      <button
        @click="toggleFullscreen"
        class="w-10 h-10 items-center justify-center rounded-xl text-white bg-white/10 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 transition hidden md:flex cursor-pointer"
        :title="t('common.header.fullscreen')"
        :aria-label="t('common.header.fullscreen')"
      >
        <ArrowsPointingOutIcon class="w-5 h-5" />
      </button>

      <!-- Notification bell -->
      <NotificationBell />

      <!-- Divider: members only see it from lg (profile button is hidden before that) -->
      <div
        class="w-px h-6 bg-amber-400/40 mx-1 hidden"
        :class="isMember ? 'lg:block' : 'sm:block'"
      ></div>

      <!-- User profile (right side): hidden for members on phone/tablet to avoid a duplicate -->
      <button
        class="items-center gap-3 p-0.5 sm:px-3 sm:py-1.5 rounded-full sm:rounded-xl bg-white/5 hover:bg-amber-400/15 sm:border sm:border-white/10 transition flex-shrink-0"
        :class="isMember ? 'hidden lg:flex' : 'flex'"
      >
        <div class="text-right hidden md:block">
          <p class="text-xs font-bold text-white leading-tight">
            {{ displayName }}
          </p>
          <p class="text-[10px] text-amber-300 uppercase tracking-wider font-semibold">
            {{ displayRole }}
          </p>
        </div>

        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover flex-shrink-0 border-2 border-amber-400/80 shadow-sm"
        />
        <div
          v-else
          class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-amber-400 text-green-950 text-xs font-extrabold flex items-center justify-center flex-shrink-0 border-2 border-amber-400/80 shadow-sm"
        >
          {{ initials }}
        </div>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Bars3Icon,
  SunIcon,
  MoonIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import { useLanguageStore } from '@/stores/languageStore'
import { applyTheme } from '@/utils/applyTheme'
import NotificationBell from '@/features/notifications/components/NotificationBell.vue'
import DemoBadge from '@/components/common/DemoBadge.vue'

defineEmits(['toggle-sidebar'])

const authStore = useAuthStore()
const languageStore = useLanguageStore()
const { t, te } = useI18n()

// Members have the bottom nav on phones/tablets, so the burger is replaced by the avatar
const isMember = computed(() => authStore.role === 'member')

const languageOptions = [
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
  { code: 'km', label: 'ខ្មែរ', shortLabel: 'KM', flag: '🇰🇭' },
]

// The language the phone button will switch TO (so on Khmer it shows EN, on English it shows KM)
const nextLanguage = computed(
  () => languageOptions.find((o) => o.code !== languageStore.locale) || languageOptions[0]
)

function toggleLocale() {
  languageStore.setLocale(nextLanguage.value.code)
}

// Theme
const isDark = ref(false)
let themeObserver = null

// Read the current mode from the <html> "dark" class
function syncIsDark() {
  isDark.value = document.documentElement.classList.contains('dark')
}

// Switch between light and dark (applyTheme also saves the choice)
function toggleTheme() {
  applyTheme(isDark.value ? 'light' : 'dark')
  syncIsDark()
}

// Keep the icon correct even when the theme is changed elsewhere
onMounted(() => {
  syncIsDark()
  themeObserver = new MutationObserver(syncIsDark)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onBeforeUnmount(() => themeObserver?.disconnect())

// User info
const displayName = computed(() => authStore.user?.name || '...')

// Translated role label, falling back to the raw role if no translation exists
const displayRole = computed(() => {
  const role = authStore.role
  if (!role) return ''
  const key = `common.header.roles.${role}`
  return te(key) ? t(key) : role
})

// First letters of the first two words of the name, for users without an avatar
const initials = computed(() => {
  const name = authStore.user?.name || ''
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
})

// Full URL of the avatar image, or null when the user has none
const avatarUrl = computed(() => {
  if (!authStore.user?.avatar) return null
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  const baseUrl = apiBase.replace(/\/api\/?$/, '')
  return `${baseUrl}/storage/${authStore.user.avatar}`
})

// Enter or leave browser fullscreen
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}
</script>