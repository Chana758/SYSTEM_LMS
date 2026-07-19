<template>
  <div class="flex gap-2 mb-6 overflow-x-auto pb-1">
    <router-link
      v-for="item in items" :key="item.to"
      :to="item.to"
      class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200"
      :class="isActive(item.to)
        ? 'bg-emerald-700 text-white shadow-md'
        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'"
    >
      <component :is="item.icon" class="w-4 h-4" />
      {{ item.label }}
    </router-link>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import {
  ChartBarIcon, ArrowsRightLeftIcon, BanknotesIcon,
  CurrencyDollarIcon, ArchiveBoxIcon, UsersIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const isActive = (path) => route.path === path

const items = [
  { to: '/reports', label: 'Overview', icon: ChartBarIcon },
  { to: '/reports/borrow', label: 'Borrow', icon: ArrowsRightLeftIcon },
  { to: '/reports/fine', label: 'Fine', icon: BanknotesIcon },
  { to: '/reports/revenue', label: 'Revenue', icon: CurrencyDollarIcon },
  { to: '/reports/stock', label: 'Stock', icon: ArchiveBoxIcon },
  { to: '/reports/user', label: 'User', icon: UsersIcon },
]
</script>