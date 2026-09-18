<template>
  <router-link 
    :to="to" 
    class="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all group block flex flex-col justify-between"
  >
    <div class="flex items-center gap-3.5 mb-3">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0" :class="theme.iconBg">
        <component :is="icon" class="w-5 h-5" :class="theme.iconColor" />
      </div>
      <div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full" :class="theme.badgeClass">Smart Tool</span>
        <h3 class="font-black text-slate-900 text-sm mt-0.5 tracking-tight">{{ title }}</h3>
      </div>
    </div>
    <p class="text-xs font-semibold text-slate-500 leading-relaxed">{{ description }}</p>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  description: String,
  icon: { type: [Object, Function], required: true },
  to: String,
  // Stable, language-independent key that picks the color theme.
  // Previously this was guessed from the (translated) `title` text,
  // which broke as soon as the title was localized to Khmer — none of
  // the Khmer strings contain "chatbot"/"recommendation"/"scanner", so
  // every card silently fell through to the amber default. Pass one of:
  // 'chatbot' | 'recommendations' | 'scanner' | 'digital-library'
  variant: { type: String, default: 'digital-library' },
})

const THEMES = {
  chatbot: {
    iconBg: 'bg-blue-600 text-white',
    iconColor: 'text-white',
    badgeClass: 'bg-blue-50 text-blue-700',
  },
  recommendations: {
    iconBg: 'bg-emerald-600 text-white',
    iconColor: 'text-white',
    badgeClass: 'bg-emerald-50 text-emerald-700',
  },
  scanner: {
    iconBg: 'bg-purple-600 text-white',
    iconColor: 'text-white',
    badgeClass: 'bg-purple-50 text-purple-700',
  },
  'digital-library': {
    iconBg: 'bg-amber-600 text-white',
    iconColor: 'text-white',
    badgeClass: 'bg-amber-50 text-amber-700',
  },
}

const theme = computed(() => THEMES[props.variant] || THEMES['digital-library'])
</script>