<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- ============ MAIN CONTAINER WRAPPER ============ -->
    <div
      class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-300/80 dark:border-white/10 shadow-sm dark:shadow-black/30 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 transition-colors"
    >

      <!-- HEADER SECTION -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10 gap-3 sm:gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('dashboard.title') }}</h1>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('dashboard.subtitle') }}</p>
        </div>
        <div class="flex items-center gap-3 self-start sm:self-auto">
          <span
            class="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-2xs"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
            {{ t('dashboard.systemOnline') }}
          </span>
        </div>
      </div>

      <!-- Error banner (stats failed to load) -->
      <div
        v-if="store.error"
        class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-300 px-4 py-3 text-xs font-bold"
      >
        <span class="min-w-0">{{ store.error }}</span>
        <button
          type="button"
          class="px-4 py-2 sm:px-3 sm:py-1 rounded-lg bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:border-rose-400/30 dark:text-rose-200 dark:hover:bg-rose-500/20 transition cursor-pointer"
          @click="store.fetchAll()"
        >
          {{ t('dashboard.retry', 'Retry') }}
        </button>
      </div>

      <!-- Stat cards: 2 per row on phones -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-4 sm:p-5 flex flex-col justify-between text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
          :class="card.card"
        >
          <!-- Decorative glow -->
          <span class="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-125"></span>
          <span class="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl"></span>

          <div class="relative flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white/20 ring-1 ring-white/25 text-white flex items-center justify-center shadow-sm backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
              <component :is="card.icon" class="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <span
              class="hidden sm:inline text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border"
              :class="card.badge"
            >
              {{ card.badgeText }}
            </span>
          </div>
          <div class="relative">
            <!-- Skeleton while the stats are loading, so "0" is never shown for data that has not arrived -->
            <span v-if="store.statsLoading" class="block h-7 sm:h-8 w-14 rounded-lg bg-white/30 animate-pulse mb-1.5"></span>
            <p v-else class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none mb-1.5">{{ card.value }}</p>
            <p class="text-[11px] font-bold tracking-wide leading-snug" :class="card.sub">{{ card.label }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <QuickActions />

      <!-- Circulation Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        <!-- Circulation Overview Card -->
        <div
          class="bg-gradient-to-br from-slate-50/60 via-white to-white dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-900/40 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm p-4 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4 sm:mb-5 gap-3">
              <div class="min-w-0">
                <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ t('dashboard.circulationOverview') }}</h3>
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('dashboard.circulationSubtitle') }}</p>
              </div>
              <span class="flex-shrink-0 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/30 text-[10px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                {{ t('dashboard.liveData') }}
              </span>
            </div>

            <div class="space-y-3 sm:space-y-3.5">
              <!-- Currently Borrowed -->
              <div class="flex justify-between items-center gap-3 bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-400/15 dark:text-blue-300 flex items-center justify-center flex-shrink-0">
                    <BookOpenIcon class="w-4 h-4" />
                  </div>
                  <span class="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide leading-snug">{{ t('dashboard.currentlyBorrowed') }}</span>
                </div>
                <span class="flex-shrink-0 font-black text-slate-900 dark:text-white font-mono text-base px-3 py-0.5 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">{{ stats.currently_borrowed ?? 0 }}</span>
              </div>

              <!-- Overdue Books -->
              <div class="flex justify-between items-center gap-3 bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300 flex items-center justify-center flex-shrink-0">
                    <ExclamationTriangleIcon class="w-4 h-4" />
                  </div>
                  <span class="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide leading-snug">{{ t('dashboard.overdueBooks') }}</span>
                </div>
                <span class="flex-shrink-0 font-black text-rose-600 dark:text-rose-300 font-mono text-base px-3 py-0.5 rounded-lg bg-rose-50/60 dark:bg-rose-400/10 border border-rose-200 dark:border-rose-400/25">{{ stats.overdue_count ?? 0 }}</span>
              </div>

              <!-- Unpaid Fines -->
              <div class="flex justify-between items-center gap-3 bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-slate-300 dark:hover:border-white/20 transition">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
                    <BanknotesIcon class="w-4 h-4" />
                  </div>
                  <span class="text-[11px] sm:text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wide leading-snug">{{ t('dashboard.unpaidFines') }}</span>
                </div>
                <span class="flex-shrink-0 font-black text-rose-600 dark:text-rose-300 font-mono text-base px-3 py-0.5 rounded-lg bg-rose-50/60 dark:bg-rose-400/10 border border-rose-200 dark:border-rose-400/25">${{ unpaidFines }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stock Warning Card -->
        <div
          class="bg-gradient-to-br from-rose-50/40 via-white to-white dark:from-rose-500/10 dark:via-slate-800/40 dark:to-slate-900/40 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm p-4 sm:p-6 flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-4 sm:mb-5 gap-3">
              <div class="min-w-0">
                <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">{{ t('dashboard.stockWarning') }}</h3>
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('dashboard.stockWarningSubtitle') }}</p>
              </div>
              <span class="flex-shrink-0 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/30 text-[10px] font-black uppercase tracking-wider shadow-2xs flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 dark:bg-rose-400 animate-pulse"></span>
                {{ t('dashboard.inventoryAlert') }}
              </span>
            </div>

            <div
              v-if="!lowStockBooks.length"
              class="text-slate-500 dark:text-slate-400 text-xs font-bold py-10 sm:py-14 text-center bg-white dark:bg-slate-900/60 rounded-xl border border-dashed border-slate-300 dark:border-white/15 shadow-2xs"
            >
              {{ t('dashboard.noLowStock') }}
            </div>
            <div v-else class="app-scroll space-y-2.5 sm:space-y-3 overflow-y-auto max-h-[240px] pr-1">
              <div
                v-for="b in lowStockBooks"
                :key="b.id"
                class="flex justify-between items-center gap-2 text-sm bg-white dark:bg-slate-900/60 p-3 sm:p-4 rounded-xl border border-slate-200/90 dark:border-white/10 shadow-2xs hover:border-rose-200 dark:hover:border-rose-400/30 transition"
              >
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-400/15 dark:text-rose-300 flex items-center justify-center flex-shrink-0">
                    <ExclamationCircleIcon class="w-4 h-4" />
                  </div>
                  <span class="font-bold text-slate-800 dark:text-slate-100 text-xs truncate">{{ b.title }}</span>
                </div>
                <span class="text-rose-600 dark:text-rose-300 font-black text-[11px] sm:text-xs font-mono bg-rose-50 dark:bg-rose-400/10 px-2 sm:px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-400/25 flex-shrink-0 whitespace-nowrap">
                  {{ b.available_qty }}/{{ b.total_qty }} {{ t('dashboard.leftSuffix') }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Revenue Trend + Recent Activity -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RevenueChart :data="store.revenueChart" :loading="store.revenueLoading" />
        <RecentActivities :items="store.recentActivities" :loading="store.activitiesLoading" />
      </div>

      <!-- Smart Features Showcase -->
      <div class="pt-2">
        <div class="mb-3 sm:mb-4">
          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ t('dashboard.smartTools') }}</h3>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('dashboard.smartToolsSubtitle') }}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SmartFeatureCard
            :title="t('dashboard.aiChatbot')"
            :description="t('dashboard.aiChatbotDesc')"
            :icon="CpuChipIcon"
            variant="chatbot"
            to="/chatbot"
          />
          <SmartFeatureCard
            :title="t('dashboard.aiRecommendations')"
            :description="t('dashboard.aiRecommendationsDesc')"
            :icon="SparklesIcon"
            variant="recommendations"
            to="/ai-recommendation"
          />
          <SmartFeatureCard
            :title="t('dashboard.barcodeScanner')"
            :description="t('dashboard.barcodeScannerDesc')"
            :icon="QrCodeIcon"
            variant="scanner"
            to="/scanner"
          />
          <SmartFeatureCard
            :title="t('dashboard.digitalLibrary')"
            :description="t('dashboard.digitalLibraryDesc')"
            :icon="DocumentTextIcon"
            variant="digital-library"
            to="/digital-library"
          />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardStore } from '../store/dashboardStore'
import QuickActions from '../components/QuickActions.vue'
import RecentActivities from '../components/RecentActivities.vue'
import RevenueChart from '../components/RevenueChart.vue'
import SmartFeatureCard from '../components/SmartFeatureCard.vue'
import {
  BookOpenIcon,
  CheckCircleIcon,
  UsersIcon,
  ArrowsRightLeftIcon,
  CpuChipIcon,
  SparklesIcon,
  QrCodeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const store = useDashboardStore()

// Safe accessors: the API may send decimals as strings ("12.50") or null lists,
// which would otherwise crash the whole page during render.
const stats = computed(() => store.stats ?? {})

const unpaidFines = computed(() =>
  (Number(stats.value.unpaid_fines_total) || 0).toFixed(2)
)

const lowStockBooks = computed(() =>
  Array.isArray(stats.value.low_stock_books) ? stats.value.low_stock_books : []
)

// The 4 top stat cards. Full class names are written out so Tailwind can generate them.
// Badge labels go through t() with an English fallback.
// Add these keys to your locale files: dashboard.badgeTotal / badgeStock / badgeUsers / badgeToday
const statCards = computed(() => [
  {
    key: 'books',
    icon: BookOpenIcon,
    badgeText: t('dashboard.badgeTotal', 'Total'),
    value: stats.value.total_books ?? 0,
    label: t('dashboard.totalBooks'),
    card: 'from-blue-500 to-blue-700 border-blue-400/60 dark:from-blue-600 dark:to-blue-900 dark:border-blue-300/20 hover:shadow-blue-500/30',
    badge: 'bg-blue-900/30 text-blue-50 border-blue-200/30',
    sub: 'text-blue-100',
  },
  {
    key: 'available',
    icon: CheckCircleIcon,
    badgeText: t('dashboard.badgeStock', 'Stock'),
    value: stats.value.available_books ?? 0,
    label: t('dashboard.availableBooks'),
    card: 'from-emerald-500 to-emerald-700 border-emerald-400/60 dark:from-emerald-600 dark:to-emerald-900 dark:border-emerald-300/20 hover:shadow-emerald-500/30',
    badge: 'bg-emerald-900/30 text-emerald-50 border-emerald-200/30',
    sub: 'text-emerald-100',
  },
  {
    key: 'members',
    icon: UsersIcon,
    badgeText: t('dashboard.badgeUsers', 'Users'),
    value: stats.value.total_members ?? 0,
    label: t('dashboard.activeMembers'),
    card: 'from-amber-500 to-amber-700 border-amber-400/60 dark:from-amber-600 dark:to-amber-900 dark:border-amber-300/20 hover:shadow-amber-500/30',
    badge: 'bg-amber-900/30 text-amber-50 border-amber-200/30',
    sub: 'text-amber-100',
  },
  {
    key: 'today',
    icon: ArrowsRightLeftIcon,
    badgeText: t('dashboard.badgeToday', 'Today'),
    value: stats.value.borrowed_today ?? 0,
    label: t('dashboard.borrowedToday'),
    card: 'from-purple-500 to-purple-700 border-purple-400/60 dark:from-purple-600 dark:to-purple-900 dark:border-purple-300/20 hover:shadow-purple-500/30',
    badge: 'bg-purple-900/30 text-purple-50 border-purple-200/30',
    sub: 'text-purple-100',
  },
])

onMounted(() => {
  store.fetchAll()
})
</script>

<style scoped>
.app-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.45) transparent;
}
.app-scroll::-webkit-scrollbar {
  width: 6px;
}
.app-scroll::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.45);
  border-radius: 9999px;
}
</style>