<template>
  <nav class="w-64 flex-shrink-0 bg-white rounded-3xl shadow-sm border border-gray-100 p-4 space-y-7 h-fit">
    <div>
      <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2.5">Personal</p>
      <div class="space-y-1.5">
        <router-link
          v-for="item in personalItems" :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
          :class="isActive(item.to)
            ? 'bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md shadow-green-700/25'
            : 'text-gray-600 hover:bg-gray-50'"
        >
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            :class="isActive(item.to) ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-green-50'"
          >
            <component
              :is="item.icon"
              class="w-4 h-4"
              :class="isActive(item.to) ? 'text-white' : 'text-gray-400 group-hover:text-green-700'"
            />
          </span>
          <span class="flex-1">{{ item.label }}</span>
          <ChevronRightIcon
            class="w-4 h-4 transition-all"
            :class="isActive(item.to) ? 'text-white/80 translate-x-0' : 'text-gray-300 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'"
          />
        </router-link>
      </div>
    </div>

    <div v-if="['admin', 'librarian'].includes(authStore.role)">
      <p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-3 mb-2.5">System</p>
      <div class="space-y-1.5">
        <router-link
          v-for="item in systemItems" :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200"
          :class="isActive(item.to)
            ? 'bg-gradient-to-r from-green-700 to-green-600 text-white shadow-md shadow-green-700/25'
            : 'text-gray-600 hover:bg-gray-50'"
        >
          <span
            class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
            :class="isActive(item.to) ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-green-50'"
          >
            <component
              :is="item.icon"
              class="w-4 h-4"
              :class="isActive(item.to) ? 'text-white' : 'text-gray-400 group-hover:text-green-700'"
            />
          </span>
          <span class="flex-1">{{ item.label }}</span>
          <ChevronRightIcon
            class="w-4 h-4 transition-all"
            :class="isActive(item.to) ? 'text-white/80 translate-x-0' : 'text-gray-300 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'"
          />
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  UserCircleIcon, IdentificationIcon, ShieldCheckIcon,
  AdjustmentsHorizontalIcon, Cog6ToothIcon, ArchiveBoxArrowDownIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/features/auth/store/authStore'

const route = useRoute()
const authStore = useAuthStore()

const isActive = (path) => route.path === path

const personalItems = [
  { to: '/settings/profile', icon: UserCircleIcon, label: 'Profile' },
  { to: '/settings/account', icon: IdentificationIcon, label: 'Account' },
  { to: '/settings/security', icon: ShieldCheckIcon, label: 'Security' },
  { to: '/settings/preferences', icon: AdjustmentsHorizontalIcon, label: 'Preferences' },
]

const systemItems = computed(() => { 
  const items = [{ to: '/settings/system', icon: Cog6ToothIcon, label: 'System Settings' }]
  if (authStore.role === 'admin') {
    items.push({ to: '/settings/backup', icon: ArchiveBoxArrowDownIcon, label: 'Backup & Restore' })
  }
  return items
})
</script>