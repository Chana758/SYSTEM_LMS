<template>
  <header
    class="bg-green-800 h-[72px] px-6 flex items-center gap-4 sticky top-0 z-20 w-full border-b-2 border-amber-400/70 shadow-sm"
  >
    <button
      @click="$emit('toggle-sidebar')"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-white bg-white/10 hover:bg-amber-400/20 border border-white/10 transition flex-shrink-0"
    >
      <Bars3Icon class="w-6 h-6" />
    </button>

    <div class="flex-1" />

    <div class="flex items-center gap-3">

      <button
        @click="$emit('toggle-theme')"
        class="w-10 h-10 flex items-center justify-center rounded-xl text-white bg-white/10 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 transition"
        title="Toggle Theme"
      >
        <SunIcon class="w-5 h-5" />
      </button>

      <!-- Ultra-Clean Language Switcher -->
      <div class="flex items-center bg-black/25 backdrop-blur-md rounded-xl p-1 border border-white/15 shadow-inner">
        <button
          v-for="option in languageOptions"
          :key="option.code"
          @click="selectLanguage(option.code)"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
          :class="locale === option.code 
            ? 'bg-amber-400 text-green-950 shadow-md scale-105' 
            : 'text-white/70 hover:text-white hover:bg-white/10'"
          :title="option.label"
        >
          <span class="text-sm leading-none">{{ option.flag }}</span>
          <span class="tracking-wider uppercase">{{ option.shortLabel }}</span>
        </button>
      </div>

      <button
        @click="toggleFullscreen"
        class="w-10 h-10 items-center justify-center rounded-xl text-white bg-white/10 hover:bg-amber-400/20 hover:text-amber-300 border border-white/10 transition hidden md:flex"
        title="Fullscreen"
      >
        <ArrowsPointingOutIcon class="w-5 h-5" />
      </button>

      <!-- Notification Bell -->
      <NotificationBell />

      <div class="w-px h-6 bg-amber-400/40 mx-1"></div>

      <!-- User Profile Section -->
      <button
        class="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-amber-400/15 border border-white/10 transition"
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
          class="w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 border-amber-400/80 shadow-sm"
        />
        <div
          v-else
          class="w-9 h-9 rounded-full bg-amber-400 text-green-950 text-xs font-extrabold flex items-center justify-center flex-shrink-0 border-2 border-amber-400/80 shadow-sm"
        >
          {{ initials }}
        </div>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Bars3Icon,
  SunIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import NotificationBell from '@/features/notifications/components/NotificationBell.vue'

defineEmits(['toggle-sidebar', 'toggle-theme'])

const authStore = useAuthStore()
const { locale } = useI18n()

const languageOptions = [
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇬🇧' },
  { code: 'km', label: 'ខ្មែរ', shortLabel: 'KM', flag: '🇰🇭' },
]

function selectLanguage(code) {
  locale.value = code
  localStorage.setItem('locale', code)
}

const displayName = computed(() => authStore.user?.name || '...')

const displayRole = computed(() => {
  const roleMap = {
    admin: 'Administrator',
    librarian: 'Librarian',
    member: 'Member',
  }
  return roleMap[authStore.role] || authStore.role || ''
})

const initials = computed(() => {
  const name = authStore.user?.name || ''
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
})

const avatarUrl = computed(() => {
  if (!authStore.user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${authStore.user.avatar}`
})

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}
</script>