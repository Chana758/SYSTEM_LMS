<template>
  <router-link
    :to="item.path"
    :title="isCollapsed ? item.name : undefined"
    class="group relative flex items-center gap-3 rounded-xl py-1.5 transition-all duration-300"
    :class="[
      isCollapsed ? 'justify-center px-0' : 'pl-1.5 pr-3',
      isActive
        ? 'bg-gradient-to-r from-amber-400/20 via-white/10 to-white/[0.03] ring-1 ring-amber-300/30 shadow-lg shadow-black/25 dark:from-white/10 dark:via-white/[0.06] dark:to-transparent dark:ring-white/15'
        : 'hover:bg-white/[0.07] hover:translate-x-0.5',
    ]"
  >
    <!-- Light sweep on hover -->
    <span class="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
      <span class="sweep"></span>
    </span>

    <!-- Glowing gold indicator on the sidebar edge -->
    <span
      v-if="isActive"
      class="absolute -left-3 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] pointer-events-none"
    ></span>

    <!-- Icon tile -->
    <!-- Light mode: amber tile when active, green tile when idle. -->
    <!-- Dark mode: each menu keeps its own colour, both idle and active. -->
    <span
      class="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ring-1 transition-all duration-300"
      :class="isActive
        ? [
            'shine bg-gradient-to-br from-amber-300 to-amber-500 text-green-950 ring-amber-200/40 shadow-lg shadow-amber-400/40',
            tone.active,
          ]
        : [
            'bg-emerald-300/10 text-emerald-100/90 ring-white/10',
            'group-hover:scale-110 group-hover:-rotate-6 group-hover:shadow-md',
            tone.idle,
          ]"
    >
      <component :is="item.icon" class="relative z-10 h-[19px] w-[19px]" />
    </span>

    <!-- Label -->
    <span
      v-if="!isCollapsed"
      class="flex-1 truncate text-[14.5px] leading-[1.7] transition-all duration-300"
      :class="isActive ? 'font-semibold text-white' : 'text-green-50/85 group-hover:translate-x-0.5 group-hover:text-white'"
    >
      {{ item.name }}
    </span>

    <!-- Optional count badge -->
    <span
      v-if="!isCollapsed && item.badge"
      class="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black leading-none text-green-900"
    >
      {{ item.badge }}
    </span>

    <!-- Active dot -->
    <span
      v-else-if="!isCollapsed && isActive"
      class="h-1.5 w-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]"
    ></span>

    <!-- Hover arrow -->
    <ChevronRightIcon
      v-else-if="!isCollapsed"
      class="h-4 w-4 -translate-x-1.5 text-amber-300/70 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
    />
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  item: Object,
  isCollapsed: Boolean,
  isActive: { type: Boolean, default: false },
})

// Full class names are written out so Tailwind can see and generate them.
// Each tone only changes colours in dark mode (dark: prefix).
//   idle   = tile colours when the menu is not active
//   active = tile colours when the menu is active (overrides the amber light-mode tile)
const TONES = {
  amber: {
    idle: 'dark:bg-amber-400/15 dark:text-amber-300 dark:ring-amber-300/20 group-hover:dark:bg-amber-400/25 group-hover:dark:shadow-amber-400/20',
    active: 'dark:from-amber-300 dark:to-amber-500 dark:text-amber-950 dark:ring-amber-200/40 dark:shadow-amber-400/40',
  },
  blue: {
    idle: 'dark:bg-sky-400/15 dark:text-sky-300 dark:ring-sky-300/20 group-hover:dark:bg-sky-400/25 group-hover:dark:shadow-sky-400/20',
    active: 'dark:from-sky-300 dark:to-blue-500 dark:text-white dark:ring-sky-200/40 dark:shadow-sky-400/40',
  },
  violet: {
    idle: 'dark:bg-violet-400/15 dark:text-violet-300 dark:ring-violet-300/20 group-hover:dark:bg-violet-400/25 group-hover:dark:shadow-violet-400/20',
    active: 'dark:from-violet-300 dark:to-violet-500 dark:text-white dark:ring-violet-200/40 dark:shadow-violet-400/40',
  },
  pink: {
    idle: 'dark:bg-pink-400/15 dark:text-pink-300 dark:ring-pink-300/20 group-hover:dark:bg-pink-400/25 group-hover:dark:shadow-pink-400/20',
    active: 'dark:from-pink-300 dark:to-pink-500 dark:text-white dark:ring-pink-200/40 dark:shadow-pink-400/40',
  },
  emerald: {
    idle: 'dark:bg-emerald-400/15 dark:text-emerald-300 dark:ring-emerald-300/20 group-hover:dark:bg-emerald-400/25 group-hover:dark:shadow-emerald-400/20',
    active: 'dark:from-emerald-300 dark:to-emerald-500 dark:text-emerald-950 dark:ring-emerald-200/40 dark:shadow-emerald-400/40',
  },
  cyan: {
    idle: 'dark:bg-cyan-400/15 dark:text-cyan-300 dark:ring-cyan-300/20 group-hover:dark:bg-cyan-400/25 group-hover:dark:shadow-cyan-400/20',
    active: 'dark:from-cyan-300 dark:to-cyan-500 dark:text-cyan-950 dark:ring-cyan-200/40 dark:shadow-cyan-400/40',
  },
  red: {
    idle: 'dark:bg-rose-400/15 dark:text-rose-300 dark:ring-rose-300/20 group-hover:dark:bg-rose-400/25 group-hover:dark:shadow-rose-400/20',
    active: 'dark:from-rose-300 dark:to-rose-500 dark:text-white dark:ring-rose-200/40 dark:shadow-rose-400/40',
  },
  indigo: {
    idle: 'dark:bg-indigo-400/15 dark:text-indigo-300 dark:ring-indigo-300/20 group-hover:dark:bg-indigo-400/25 group-hover:dark:shadow-indigo-400/20',
    active: 'dark:from-indigo-300 dark:to-indigo-500 dark:text-white dark:ring-indigo-200/40 dark:shadow-indigo-400/40',
  },
  orange: {
    idle: 'dark:bg-orange-400/15 dark:text-orange-300 dark:ring-orange-300/20 group-hover:dark:bg-orange-400/25 group-hover:dark:shadow-orange-400/20',
    active: 'dark:from-orange-300 dark:to-orange-500 dark:text-orange-950 dark:ring-orange-200/40 dark:shadow-orange-400/40',
  },
  teal: {
    idle: 'dark:bg-teal-400/15 dark:text-teal-300 dark:ring-teal-300/20 group-hover:dark:bg-teal-400/25 group-hover:dark:shadow-teal-400/20',
    active: 'dark:from-teal-300 dark:to-teal-500 dark:text-teal-950 dark:ring-teal-200/40 dark:shadow-teal-400/40',
  },
}

// Falls back to emerald when a menu item has no colour
const tone = computed(() => TONES[props.item?.color] || TONES.emerald)
</script>

<style scoped>
.sweep {
  position: absolute;
  inset: 0;
  transform: translateX(-120%);
  background: linear-gradient(105deg, transparent 35%, rgba(255, 255, 255, 0.12) 50%, transparent 65%);
  transition: transform 0.7s ease;
}
.group:hover .sweep {
  transform: translateX(120%);
}

.shine {
  position: relative;
  overflow: hidden;
}
.shine::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.6) 50%, transparent 70%);
  transform: translateX(-120%);
  animation: shine 3.4s ease-in-out infinite;
}
@keyframes shine {
  0%,
  60% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(120%);
  }
}
@media (prefers-reduced-motion: reduce) {
  .shine::after {
    animation: none;
  }
  .sweep {
    transition: none;
  }
}
</style>