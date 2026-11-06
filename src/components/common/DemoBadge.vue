<template>
  <span
    v-if="authStore.isDemo"
    class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex-shrink-0
           border-amber-500/60 bg-amber-400/20 text-amber-700
           dark:border-amber-400/60 dark:bg-amber-400/15 dark:text-amber-300
           sm:border-amber-400/60 sm:bg-amber-400/15 sm:text-amber-300"
    :title="t('common.demo.tooltip')"
  >
    <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500 dark:bg-amber-300 sm:bg-amber-300"></span>
    {{ t('common.demo.badge') }}
  </span>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/features/auth/store/authStore'

const { t } = useI18n()
const authStore = useAuthStore()
</script>