<template>
  <div class="flex h-screen bg-gray-50">
    <Sidebar :isCollapsed="isSidebarCollapsed" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="bg-green-800 h-16 flex items-center justify-between px-6 flex-shrink-0">
        <div class="flex items-center gap-4 flex-1">
          <button @click="isSidebarCollapsed = !isSidebarCollapsed" class="text-white">
            <Bars3Icon class="w-6 h-6" />
          </button>

          <div class="relative flex-1 max-w-md">
            <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search books, members..."
              class="w-full bg-white rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button class="text-white/90 hover:text-white">
            <SunIcon class="w-5 h-5" />
          </button>
          <button class="text-white/90 hover:text-white">
            <GlobeAltIcon class="w-5 h-5" />
          </button>
          <button class="text-white/90 hover:text-white">
            <ArrowsPointingOutIcon class="w-5 h-5" />
          </button>
          <button class="relative text-white/90 hover:text-white">
            <BellIcon class="w-5 h-5" />
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div class="flex items-center gap-2 pl-2 border-l border-white/20">
            <div class="text-right leading-tight">
              <p class="text-white text-sm font-semibold">{{ authStore.user?.name }}</p>
              <p class="text-white/70 text-[10px] uppercase tracking-wide">{{ authStore.role }}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
              {{ userInitial }}
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Bars3Icon, MagnifyingGlassIcon, SunIcon, GlobeAltIcon,
  ArrowsPointingOutIcon, BellIcon,
} from '@heroicons/vue/24/outline'
import Sidebar from '@/components/layout/Sidebar.vue'
import { useAuthStore } from '@/features/auth/store/authStore'

const authStore = useAuthStore()
const isSidebarCollapsed = ref(false)

const userInitial = computed(() => {
  const name = authStore.user?.name || ''
  return name.charAt(0).toUpperCase() || '?'
})
</script>