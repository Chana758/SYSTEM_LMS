<template>
  <!-- Member page = web app. Bottom padding keeps the last card clear of the fixed bottom nav (64px + safe area). -->
  <div class="space-y-5 sm:space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-black/30 flex items-center gap-3 sm:gap-4 transition-colors">
      <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-sky-300 dark:border-white/20 shadow-lg shadow-sky-500/40 dark:shadow-none flex items-center justify-center flex-shrink-0">
        <WalletIcon class="w-6 h-6 text-white" />
      </div>
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('fines.myFines.title') }}</h1>
        <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('fines.myFines.subtitle') }}</p>
      </div>
    </div>

    <!-- One merged card: compact balance strip on top, records below -->
    <div class="overflow-hidden rounded-3xl border-2 border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 shadow-lg dark:shadow-black/30 transition-colors">

      <!-- Balance strip -->
      <div
        class="relative overflow-hidden bg-gradient-to-r px-4 sm:px-6 py-5 text-white"
        :class="hasDebt
          ? 'from-rose-500 via-rose-600 to-rose-700 dark:from-rose-600 dark:via-rose-700 dark:to-rose-900'
          : 'from-sky-500 via-blue-600 to-indigo-700 dark:from-sky-600 dark:via-blue-700 dark:to-indigo-900'"
      >
        <span class="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent"></span>
        <span class="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl"></span>

        <div class="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div class="w-12 h-12 rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <ExclamationCircleIcon v-if="hasDebt" class="w-6 h-6 text-white" />
              <CheckCircleIcon v-else class="w-6 h-6 text-white" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-extrabold uppercase tracking-widest text-white/75">{{ t('fines.myFines.totalOutstanding') }}</p>
              <p class="text-3xl font-black tracking-tight leading-tight">{{ money(store.myTotalUnpaid) }}</p>
              <p class="text-[11px] font-bold text-white/80 line-clamp-2 sm:line-clamp-1">
                <template v-if="hasDebt">{{ countBy('unpaid') }} {{ t('fines.outstandingRecords') }} · </template>
                {{ hasDebt ? t('fines.myFines.settleHint') : t('fines.myFines.allClearHint') }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-black/20 border border-white/20">
              <CheckCircleIcon class="w-4 h-4" />
              {{ t('fines.paid') }} {{ money(sumBy('paid')) }}
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold bg-black/20 border border-white/20">
              <HandRaisedIcon class="w-4 h-4" />
              {{ t('fines.waived') }} {{ money(sumBy('waived')) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Records -->
      <div class="p-4 sm:p-6 space-y-4 sm:space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{{ t('fines.myFines.fineRecords') }}</h3>

          <!-- Filter tabs with counts: full width segmented control on phones -->
          <div class="flex w-full sm:inline-flex sm:w-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 sm:self-start">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              type="button"
              @click="activeTab = tab.key"
              class="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3.5 py-2 sm:py-1.5 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer min-w-0"
              :class="activeTab === tab.key
                ? ['text-white shadow-md bg-gradient-to-br', accent]
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'"
            >
              <span class="truncate">{{ tab.label }}</span>
              <span
                class="min-w-5 px-1.5 py-0.5 rounded-full text-[10px] leading-none text-center flex-shrink-0"
                :class="activeTab === tab.key
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-200/70 dark:bg-white/10 text-slate-500 dark:text-slate-400'"
              >{{ tab.count }}</span>
            </button>
          </div>
        </div>

        <div class="border-t border-slate-100 dark:border-white/10"></div>

        <div v-if="store.loading" class="text-center py-12 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">
          {{ t('fines.myFines.loading') }}
        </div>

        <div v-else-if="!filteredFines.length" class="text-center py-10 space-y-3">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 border-2 border-sky-300 dark:border-white/20 shadow-lg shadow-sky-500/40 dark:shadow-none flex items-center justify-center">
            <SparklesIcon class="w-7 h-7 text-white" />
          </div>
          <div>
            <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{{ t('fines.myFines.noRecords') }}</p>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{{ t('fines.myFines.noRecordsHint') }}</p>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div
            v-for="fine in filteredFines"
            :key="fine.id"
            class="group relative overflow-hidden rounded-3xl border-2 border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-slate-800/50 p-4 pl-5 sm:p-5 sm:pl-6 space-y-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:border-slate-300 dark:hover:border-white/25"
          >
            <span class="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b" :class="meta(fine.status).bar"></span>

            <div class="flex justify-between items-start gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-11 h-11 rounded-2xl border-2 flex items-center justify-center flex-shrink-0 bg-gradient-to-br shadow-lg dark:shadow-none" :class="meta(fine.status).iconBox">
                  <BookOpenIcon class="w-5 h-5 text-white" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">
                    {{ fine.borrow?.book_copy?.book?.title || 'Unknown Book' }}
                  </p>
                  <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400 capitalize">
                    {{ t('fines.reason') }}: {{ fine.reason }}
                  </p>
                </div>
              </div>
              <FineStatusBadge :status="fine.status" class="flex-shrink-0" />
            </div>

            <div class="flex justify-between items-end pt-3 border-t border-slate-200/80 dark:border-white/10">
              <span class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ formatDate(fine.created_at) }}</span>
              <span class="text-2xl font-black leading-none" :class="meta(fine.status).amount">
                {{ money(fine.amount) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  BookOpenIcon, WalletIcon, SparklesIcon,
  ExclamationCircleIcon, CheckCircleIcon, HandRaisedIcon,
} from '@heroicons/vue/24/outline'
import { useFineStore } from '../store/fineStore'
import FineStatusBadge from '../components/FineStatusBadge.vue'

const { t } = useI18n()
const store = useFineStore()

const activeTab = ref('all')

const money = (n) => `$${Number(n || 0).toFixed(2)}`
function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB') : '—'
}

const hasDebt = computed(() => Number(store.myTotalUnpaid) > 0)

// Active-tab colour follows the banner colour.
// Full class names so Tailwind can generate them.
const accent = computed(() =>
  hasDebt.value ? 'from-rose-500 to-rose-700' : 'from-sky-500 to-indigo-600'
)

const STATUS_META = {
  unpaid: {
    bar: 'from-rose-400 to-rose-600',
    iconBox: 'from-rose-400 to-rose-600 border-rose-300 dark:border-rose-300/30 shadow-rose-500/40',
    amount: 'text-rose-600 dark:text-rose-400',
  },
  paid: {
    bar: 'from-emerald-400 to-emerald-600',
    iconBox: 'from-emerald-400 to-emerald-600 border-emerald-300 dark:border-emerald-300/30 shadow-emerald-500/40',
    amount: 'text-slate-900 dark:text-white',
  },
  waived: {
    bar: 'from-violet-400 to-violet-600',
    iconBox: 'from-violet-400 to-violet-600 border-violet-300 dark:border-violet-300/30 shadow-violet-500/40',
    amount: 'text-slate-900 dark:text-white',
  },
}
function meta(status) {
  return STATUS_META[status] || STATUS_META.paid
}

function sumBy(status) {
  return store.myFines
    .filter((f) => f.status === status)
    .reduce((s, f) => s + Number(f.amount || 0), 0)
}
function countBy(status) {
  return store.myFines.filter((f) => f.status === status).length
}

const tabs = computed(() => [
  { key: 'all', label: t('fines.allStatuses'), count: store.myFines.length },
  { key: 'unpaid', label: t('fines.unpaid'), count: countBy('unpaid') },
  { key: 'paid', label: t('fines.paid'), count: countBy('paid') },
  { key: 'waived', label: t('fines.waived'), count: countBy('waived') },
])

const filteredFines = computed(() =>
  activeTab.value === 'all'
    ? store.myFines
    : store.myFines.filter((f) => f.status === activeTab.value)
)

onMounted(() => store.fetchMyFines())
</script>