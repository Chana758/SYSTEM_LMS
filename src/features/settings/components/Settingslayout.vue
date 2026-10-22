<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-none flex items-center gap-3 sm:gap-4">
      <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/30 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
        👤
      </div>
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('settings.pageTitle') }}</h1>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('settings.pageSubtitle') }}</p>
      </div>
    </div>

    <!-- Phone: nav on top (swipeable tabs). lg+: nav on the left -->
    <div class="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
      <div class="w-full lg:w-72 flex-shrink-0 min-w-0">
        <SettingsNav />
      </div>
      <div class="w-full flex-1 min-w-0 space-y-4 sm:space-y-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import SettingsNav from './SettingsNav.vue'

const { t } = useI18n()
</script>