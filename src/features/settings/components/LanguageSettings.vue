<template>
  <div>
    <p class="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-1">{{ t('settings.language.title') }}</p>
    <p class="text-xs text-gray-400 dark:text-slate-400 mb-3">{{ t('settings.language.subtitle') }}</p>

    <div class="grid grid-cols-2 gap-2 max-w-sm">
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        @click="languageStore.setLocale(opt.value)"
        class="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer"
        :class="languageStore.locale === opt.value
          ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-300'
          : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'"
      >
        <span class="text-base">{{ opt.flag }}</span>
        {{ opt.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/languageStore'

const { t } = useI18n()
const languageStore = useLanguageStore()

const options = [
  { value: 'en', label: 'English', flag: '🇬🇧' },
  { value: 'km', label: 'ខ្មែរ', flag: '🇰🇭' },
]
</script>