<template>
  <router-link
    :to="to"
    class="group relative overflow-hidden flex flex-col justify-between rounded-2xl border-2 bg-white dark:bg-slate-800/50 dark:bg-none p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]"
    :class="theme.card"
  >
    <!-- Soft colour glow in the corner -->
    <span
      class="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      :class="theme.glow"
    ></span>

    <div class="relative flex items-center gap-3.5 mb-3">
      <div
        class="w-11 h-11 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-6"
        :class="theme.icon"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>
      <div class="min-w-0">
        <span
          class="inline-block text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border"
          :class="theme.badge"
        >
          {{ $t('dashboard.smartTool', 'Smart Tool') }}
        </span>
        <h3 class="font-black text-slate-900 dark:text-white text-sm mt-0.5 tracking-tight truncate">{{ title }}</h3>
      </div>
    </div>

    <p class="relative text-xs font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">{{ description }}</p>

    <ArrowRightIcon
      class="hidden sm:block absolute bottom-4 right-4 h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      :class="theme.arrow"
    />
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  title: String,
  description: String,
  icon: { type: [Object, Function], required: true },
  to: String,
  // Stable, language-independent key that picks the color theme.
  // Pass one of: 'chatbot' | 'recommendations' | 'scanner' | 'digital-library'
  variant: { type: String, default: 'digital-library' },
})

// Full class names are written out so Tailwind can generate them.
const THEMES = {
  chatbot: {
    icon: 'from-blue-500 to-blue-700 shadow-blue-500/30',
    badge: 'bg-blue-100/70 text-blue-700 border-blue-200 dark:bg-blue-400/10 dark:text-blue-300 dark:border-transparent',
    card: 'bg-gradient-to-bl from-blue-100/80 via-white to-white border-blue-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-blue-400/40 hover:shadow-blue-500/15',
    glow: 'bg-blue-400/20',
    arrow: 'text-blue-500 dark:text-blue-300',
  },
  recommendations: {
    icon: 'from-emerald-500 to-emerald-700 shadow-emerald-500/30',
    badge: 'bg-emerald-100/70 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-transparent',
    card: 'bg-gradient-to-bl from-emerald-100/80 via-white to-white border-emerald-200 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-400/40 hover:shadow-emerald-500/15',
    glow: 'bg-emerald-400/20',
    arrow: 'text-emerald-500 dark:text-emerald-300',
  },
  scanner: {
    icon: 'from-purple-500 to-purple-700 shadow-purple-500/30',
    badge: 'bg-indigo-100/70 text-purple-700 border-indigo-200 dark:bg-purple-400/10 dark:text-purple-300 dark:border-transparent',
    card: 'bg-gradient-to-bl from-indigo-100/80 via-white to-white border-indigo-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-400/40 hover:shadow-purple-500/15',
    glow: 'bg-purple-400/20',
    arrow: 'text-purple-500 dark:text-purple-300',
  },
  'digital-library': {
    icon: 'from-amber-500 to-amber-700 shadow-amber-500/30',
    badge: 'bg-amber-100/70 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-transparent',
    card: 'bg-gradient-to-bl from-amber-100/80 via-white to-white border-amber-200 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-400/40 hover:shadow-amber-500/15',
    glow: 'bg-amber-400/20',
    arrow: 'text-amber-500 dark:text-amber-300',
  },
}

const theme = computed(() => THEMES[props.variant] || THEMES['digital-library'])
</script>