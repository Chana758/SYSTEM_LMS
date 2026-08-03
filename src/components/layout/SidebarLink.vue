<template>
  <router-link
    :to="item.path"
    class="relative flex items-center gap-2.5 py-5.5 border pl-4 pr-3 rounded-xl transition-all overflow-hidden group"
    :class="isActive
      ? 'bg-green-800 border-amber-400/40 shadow-sm'
      : 'bg-white border-gray-200 hover:bg-emerald-50'"
  >
    <!-- Left accent bar: gold when active, green otherwise -->
    <span
      class="absolute left-0 top-0 bottom-0 w-1.5 rounded-r-md font-bold pointer-events-none"
      :class="isActive ? 'bg-amber-400' : 'bg-green-700'"
    ></span>

    <component
      :is="item.icon"
      class="w-[23px] h-[22px] flex-shrink-0"
      :class="isActive ? 'text-amber-300' : 'text-green-700'"
    />

    <span
      v-if="!isCollapsed"
      class="text-[15px] flex-1"
      :class="isActive ? 'text-white font-medium' : 'text-gray-800'"
    >
      {{ item.name }}
    </span>

    <ChevronRightIcon
      v-if="!isCollapsed"
      class="w-5 h-5 font-bold"
      :class="isActive ? 'text-amber-300' : 'text-green-700'"
    />
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ item: Object, isCollapsed: Boolean })

const route = useRoute()

// Active if current path matches exactly, or is a sub-route
// (e.g. /books/create should still highlight "Books")
const isActive = computed(() => {
  return (
    route.path === props.item.path ||
    route.path.startsWith(props.item.path + '/')
  )
})
</script>