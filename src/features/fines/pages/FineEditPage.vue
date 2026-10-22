<template>
  <div v-if="store.currentFine" class="space-y-5 sm:space-y-6 pb-12 max-w-2xl">
    <!-- Header Banner: back button is icon-only on phones -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-black/30 flex items-center justify-between gap-3 sm:gap-4 transition-colors">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          ✏️
        </div>
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('fines.editPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('fines.editPage.subtitle') }}</p>
        </div>
      </div>
      <router-link
        to="/fines"
        :title="t('fines.createPage.back')"
        :aria-label="t('fines.createPage.back')"
        class="border-2 border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full sm:rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center justify-center gap-1.5 flex-shrink-0 active:scale-95"
      >
        <span class="text-base sm:text-xs">←</span><span class="hidden sm:inline">{{ t('fines.createPage.back') }}</span>
      </router-link>
    </div>

    <!-- Form Container -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-lg dark:shadow-black/30 space-y-5 sm:space-y-6 transition-colors">
      <div class="bg-amber-50 dark:bg-amber-500/10 border-2 border-amber-200 dark:border-amber-400/25 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
        <span class="text-amber-600 dark:text-amber-300 text-base font-black">⚠️</span>
        <p class="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
          {{ t('fines.editPage.onlyUnpaidHint') }}
        </p>
      </div>

      <FineForm
        :initial-data="store.currentFine"
        :loading="store.loading"
        :errors="store.errors"
        @submit="handleSubmit"
        @cancel="router.back()"
      />
    </div>
  </div>
  <div v-else class="text-center py-16 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">{{ t('fines.editPage.loading') }}</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFineStore } from '../store/fineStore'
import FineForm from '../components/FineForm.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useFineStore()

onMounted(() => store.fetchFine(route.params.id))

async function handleSubmit(payload) {
  const result = await store.updateFine(route.params.id, payload)
  if (result.success) {
    router.push({ name: 'fine-list' })
  }
}
</script>