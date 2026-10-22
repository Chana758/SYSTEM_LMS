<template>
  <div v-if="store.currentFine" class="space-y-5 sm:space-y-6 pb-12 max-w-2xl">
    <!-- Header Banner: back button is icon-only on phones -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-black/30 flex items-center justify-between gap-3 sm:gap-4 transition-colors">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          📄
        </div>
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('fines.detailPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('fines.detailPage.subtitle') }}</p>
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

    <!-- Details Card Container -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-lg dark:shadow-black/30 space-y-4 sm:space-y-5 transition-colors">
      <div class="flex justify-between items-center gap-4 py-2.5 border-b border-slate-100 dark:border-white/10">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">{{ t('fines.detailPage.member') }}</span>
        <span class="text-xs font-extrabold text-slate-900 dark:text-white text-right min-w-0 break-words">{{ store.currentFine.borrow?.member?.user?.name }}</span>
      </div>

      <div class="flex justify-between items-center gap-4 py-2.5 border-b border-slate-100 dark:border-white/10">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">{{ t('fines.detailPage.book') }}</span>
        <span class="text-xs font-extrabold text-slate-900 dark:text-white text-right min-w-0 break-words">{{ store.currentFine.borrow?.book_copy?.book?.title }}</span>
      </div>

      <div class="flex justify-between items-center gap-4 py-2.5 border-b border-slate-100 dark:border-white/10">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">{{ t('fines.detailPage.amount') }}</span>
        <span class="text-sm font-black text-slate-900 dark:text-white">${{ Number(store.currentFine.amount).toFixed(2) }}</span>
      </div>

      <div class="flex justify-between items-center gap-4 py-2.5 border-b border-slate-100 dark:border-white/10">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">{{ t('fines.detailPage.reason') }}</span>
        <span class="text-xs font-extrabold text-slate-700 dark:text-slate-200 capitalize text-right">{{ store.currentFine.reason }}</span>
      </div>

      <div class="flex justify-between items-center gap-4 py-2.5 border-b border-slate-100 dark:border-white/10">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">{{ t('fines.detailPage.status') }}</span>
        <FineStatusBadge :status="store.currentFine.status" />
      </div>

      <div v-if="store.currentFine.paid_at" class="flex justify-between items-center gap-4 py-2.5 border-b border-slate-100 dark:border-white/10">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex-shrink-0">{{ t('fines.detailPage.paidAt') }}</span>
        <span class="text-xs font-extrabold text-slate-700 dark:text-slate-200 text-right">{{ formatDate(store.currentFine.paid_at) }}</span>
      </div>

      <div v-if="store.currentFine.notes" class="pt-3 space-y-1.5">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('fines.detailPage.notes') }}</p>
        <div class="bg-slate-50 dark:bg-slate-800/60 border-2 border-slate-200 dark:border-white/10 rounded-xl p-3.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs break-words">
          {{ store.currentFine.notes }}
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">{{ t('fines.detailPage.loading') }}</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFineStore } from '../store/fineStore'
import FineStatusBadge from '../components/FineStatusBadge.vue'

const { t } = useI18n()
const route = useRoute()
const store = useFineStore()

function formatDate(d) { return new Date(d).toLocaleString('en-GB') }

onMounted(() => store.fetchFine(route.params.id))
</script>