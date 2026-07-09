<template>
  <header
    class="bg-green-700 h-[72px] px-6 flex items-center gap-4 sticky top-0 z-20 w-full"
  >
    <button
      @click="$emit('toggle-sidebar')"
      class="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/15 transition flex-shrink-0"
    >
      <div>
         <Bars3Icon class="w-10 h-9 bg-white/20 rounded-md p-1" />
      </div>
    </button>

    <div class="relative w-full max-w-[400px]">
      <MagnifyingGlassIcon
        class="w-[15px] h-[15px] text-gray-800 font-bold absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
      />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search books, members..."
        class="w-full bg-gray-100 border-none rounded-lg pl-8 pr-4 py-[7px] text-[13px] text-gray-800 placeholder-gray-600 outline-none focus:bg-white/25 transition"
      />
    </div>

    <div class="flex-1" />

    <div class="flex items-center gap-0.5">

      <button
        @click="$emit('toggle-theme')"
        class="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/15 transition"
        title="Toggle Theme"
      >
        <SunIcon class="w-[18px] h-[18px]" />
      </button>

      <button
        @click="$emit('toggle-language')"
        class="w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/15 transition"
        title="Language"
      >
        <GlobeAltIcon class="w-[18px] h-[18px]" />
      </button>

      <button
        @click="toggleFullscreen"
        class="w-9 h-9 items-center justify-center rounded-lg text-white hover:bg-white/15 transition hidden md:flex"
        title="Fullscreen"
      >
        <ArrowsPointingOutIcon class="w-[18px] h-[18px]" />
      </button>

      <button
        class="relative w-9 h-9 flex items-center justify-center rounded-lg text-white hover:bg-white/15 transition"
        title="Notifications"
      >
        <BellIcon class="w-[18px] h-[18px]" />
        <span
          class="absolute top-[7px] right-[7px] w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-green-700"
        ></span>
      </button>

      <div class="w-px h-6 bg-white/30 mx-2"></div>

      <button
        class="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/15 transition"
      >
        <div class="text-right hidden md:block">
          <p class="text-[12.5px] font-bold text-white leading-tight">
            {{ displayName }}
          </p>
          <p class="text-[9.5px] text-white/70 uppercase tracking-wide">
            {{ displayRole }}
          </p>
        </div>

        <img
          v-if="avatarUrl"
          :src="avatarUrl"
          class="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-white/30"
        />
        <div
          v-else
          class="w-8 h-8 rounded-full bg-white text-green-700 text-[13px] font-extrabold flex items-center justify-center flex-shrink-0"
        >
          {{ initials }}
        </div>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  GlobeAltIcon,
  ArrowsPointingOutIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

defineEmits(['toggle-sidebar', 'toggle-theme', 'toggle-language'])

const searchQuery = ref('')
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