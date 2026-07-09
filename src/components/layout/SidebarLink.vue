<template>
  <router-link
    :to="item.path"
    class="relative flex items-center gap-2.5 py-5.5 border border-gray-200 pl-4 pr-3 bg-white rounded-xl transition-all overflow-hidden group hover:bg-emerald-50"
    active-class="bg-emerald-50"
  >
    <!-- Left green bar only (no curve) -->
    <span class="absolute left-0 top-0 bottom-0 w-1.5 bg-green-700 rounded-r-md font-bold pointer-events-none"></span>

    <component :is="item.icon" class="w-[23px] h-[22px] text-green-700 flex-shrink-0" />

    <span v-if="!isCollapsed" class="text-[15px] text-gray-800 flex-1">
      {{ item.name }}
    </span>

    <ChevronRightIcon v-if="!isCollapsed" class="w-5 h-5 font-bold text-green-700" />
  </router-link>
</template>

<script setup>
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
defineProps({ item: Object, isCollapsed: Boolean })
</script>