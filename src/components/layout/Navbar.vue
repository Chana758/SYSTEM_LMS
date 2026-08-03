<template>
  <header
    class="bg-green-800 h-[72px] px-6 flex items-center gap-4 sticky top-0 z-20 w-full border-b-2 border-amber-400/70"
  >
    <button
      @click="$emit('toggle-sidebar')"
      class="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-amber-400/20 transition flex-shrink-0"
    >
      <div>
         <Bars3Icon class="w-10 h-9 bg-white/20 rounded-md p-1" />
      </div>
    </button>

    <div class="flex-1" />

    <div class="flex items-center gap-0.5">

      <button
        @click="$emit('toggle-theme')"
        class="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-amber-400/20 hover:text-amber-300 transition"
        title="Toggle Theme"
      >
        <SunIcon class="w-[18px] h-[18px]" />
      </button>

      <button
        @click="$emit('toggle-language')"
        class="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-amber-400/20 hover:text-amber-300 transition"
        title="Language"
      >
        <GlobeAltIcon class="w-[18px] h-[18px]" />
      </button>

      <button
        @click="toggleFullscreen"
        class="w-9 h-9 items-center justify-center rounded-lg text-white hover:bg-amber-400/20 hover:text-amber-300 transition hidden md:flex"
        title="Fullscreen"
      >
        <ArrowsPointingOutIcon class="w-[18px] h-[18px]" />
      </button>

      <!-- ជំនួស static bell button ដោយ NotificationBell.vue -->
      <NotificationBell />

      <div class="w-px h-6 bg-amber-400/40 mx-2"></div>

      <button
        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-amber-400/15 transition"
      >
        <div class="text-right hidden md:block">
          <p class="text-[12.5px] font-bold text-white leading-tight">
            {{ displayName }}
          </p>
          <p class="text-[9.5px] text-amber-300/90 uppercase tracking-wide font-semibold">
            {{ displayRole }}
          </p>
        </div>

        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          class="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-amber-400/60"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-white text-green-800 text-[13px] font-extrabold flex items-center justify-center flex-shrink-0 border-2 border-amber-400/60"
        >
          {{ initials }}
        </div>
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import {
  Bars3Icon,
  SunIcon,
  GlobeAltIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'
import NotificationBell from '@/features/notifications/components/NotificationBell.vue'

defineEmits(['toggle-sidebar', 'toggle-theme', 'toggle-language'])

const authStore = useAuthStore()

// Display user name, fallback if loading
const displayName = computed(() => authStore.user?.name || '...')

// Format role: capitalize the first letter (e.g., admin -> Administrator)
const displayRole = computed(() => {
  const roleMap = {
    admin: 'Administrator',
    librarian: 'Librarian',
    member: 'Member',
  }
  return roleMap[authStore.role] || authStore.role || ''
})

// Generate initials for avatar circle (e.g., "Sam Channa" -> "SC")
const initials = computed(() => {
  const name = authStore.user?.name || ''
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
})

// Full URL for avatar image
const avatarUrl = computed(() => {
  if (!authStore.user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${authStore.user.avatar}`
})

// Toggle browser fullscreen mode
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen?.()
  } else {
    document.exitFullscreen?.()
  }
}
</script>