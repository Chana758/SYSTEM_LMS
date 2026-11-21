<template>
  <!-- B5.4 (Sam): every payment (KHQR + cash, fines + deposits) to check the money received -->
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- ============ HEADER + STAT CARDS ============ -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm space-y-5 sm:space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-emerald-300 dark:border-white/20 shadow-lg shadow-emerald-500/30 dark:shadow-none flex items-center justify-center flex-shrink-0">
            <ReceiptPercentIcon class="w-6 h-6 text-white" />
          </div>
          <div class="min-w-0">
            <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('fines.payments.title') }}</h1>
            <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ t('fines.payments.subtitle') }}</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <!-- End-of-day cash close -->
        <button type="button" @click="showClosing = true"
          class="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-extrabold shadow-md cursor-pointer whitespace-nowrap">
          <BanknotesIcon class="w-4 h-4" />{{ t('fines.closing.button') }}
        </button>
        <!-- Quick period -->
        <div class="flex w-full md:w-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
          <button
            v-for="p in periods"
            :key="p.key"
            type="button"
            @click="setPeriod(p.key)"
            class="flex-1 md:flex-none px-3 sm:px-4 py-2 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap"
            :class="period === p.key
              ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'"
          >{{ p.label }}</button>
        </div>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-1">
        <div
          v-for="card in cards"
          :key="card.key"
          class="bg-gradient-to-br rounded-2xl border shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]"
          :class="card.cls"
        >
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <component :is="card.icon" class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black uppercase tracking-widest bg-black/15 px-2.5 py-1 rounded-full border border-white/20">{{ card.badge }}</span>
          </div>
          <div class="min-w-0">
            <p class="text-xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 truncate">{{ card.value }}</p>
            <p class="text-[11px] font-bold text-white/80 tracking-wide truncate">{{ card.label }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ TOOLBAR ============ -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-3 sm:p-4 shadow-sm">
      <div class="grid grid-cols-2 lg:grid-cols-12 gap-3">
        <div class="relative col-span-2 lg:col-span-4">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="filters.search"
            @input="debouncedLoad"
            type="search"
            enterkeyhint="search"
            :placeholder="t('fines.payments.search')"
            :class="[inputCls, 'pl-10 pr-4']"
          />
        </div>
        <select v-model="filters.purpose" @change="load(1)" :class="[inputCls, 'lg:col-span-2 px-3 cursor-pointer']">
          <option value="">{{ t('fines.payments.allPurposes') }}</option>
          <option v-for="pp in purposes" :key="pp" :value="pp">{{ t(`fines.payments.purpose.${pp}`) }}</option>
        </select>
        <select v-model="filters.method" @change="load(1)" :class="[inputCls, 'lg:col-span-2 px-3 cursor-pointer']">
          <option value="">{{ t('fines.payments.allMethods') }}</option>
          <option value="khqr">KHQR</option>
          <option value="cash">{{ t('fines.payments.cash') }}</option>
        </select>
        <select v-model="filters.status" @change="load(1)" :class="[inputCls, 'col-span-2 lg:col-span-2 px-3 cursor-pointer']">
          <option value="">{{ t('fines.payments.allStatus') }}</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ t(`fines.payments.status.${s}`) }}</option>
        </select>
        <button
          type="button"
          @click="showDates = !showDates"
          class="col-span-2 lg:col-span-2 inline-flex items-center justify-center gap-2 rounded-xl border text-sm sm:text-xs font-bold py-3 sm:py-2.5 transition cursor-pointer"
          :class="filters.from || filters.to || showDates
            ? 'border-emerald-600 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/40'
            : 'border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900'"
        >
          <CalendarDaysIcon class="w-4 h-4" />{{ t('fines.payments.dateRange') }}
        </button>

        <div v-if="showDates" class="col-span-2 lg:col-span-12 grid grid-cols-2 gap-3">
          <label class="block">
            <span class="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{{ t('fines.payments.from') }}</span>
            <input v-model="filters.from" type="date" @change="period = 'custom'; load(1)" :class="[inputCls, 'px-3 dark:[color-scheme:dark]']" />
          </label>
          <label class="block">
            <span class="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">{{ t('fines.payments.to') }}</span>
            <input v-model="filters.to" type="date" @change="period = 'custom'; load(1)" :class="[inputCls, 'px-3 dark:[color-scheme:dark]']" />
          </label>
        </div>
      </div>
    </div>

    <!-- ============ LOADING / EMPTY ============ -->
    <div v-if="loading" class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm text-center py-16">
      <div class="w-7 h-7 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('fines.payments.loading') }}</p>
    </div>

    <div v-else-if="!rows.length" class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm text-center py-14 px-4">
      <div class="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-emerald-300 dark:border-white/20 shadow-lg shadow-emerald-500/30 dark:shadow-none flex items-center justify-center mb-4">
        <QrCodeIcon class="w-8 h-8 text-white" />
      </div>
      <p class="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">{{ t('fines.payments.empty') }}</p>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">{{ hasFilters ? t('fines.payments.emptyFiltered') : t('fines.payments.emptyHint') }}</p>
      <button v-if="hasFilters" type="button" @click="clearFilters" class="mt-4 px-4 py-2 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
        {{ t('fines.payments.clearFilters') }}
      </button>
    </div>

    <template v-else>
      <!-- ============ TABLE (md and up) ============ -->
      <div class="hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th class="px-5 py-3.5">{{ t('fines.payments.member') }}</th>
                <th class="px-5 py-3.5">{{ t('fines.payments.purposeLabel') }}</th>
                <th class="px-5 py-3.5">{{ t('fines.payments.method') }}</th>
                <th class="px-5 py-3.5">{{ t('fines.payments.reference') }}</th>
                <th class="px-5 py-3.5">{{ t('fines.payments.date') }}</th>
                <th class="px-5 py-3.5 text-right">{{ t('fines.payments.amount') }}</th>
                <th class="px-5 py-3.5">{{ t('fines.payments.statusLabel') }}</th>
                <th class="px-5 py-3.5 text-right"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <tr v-for="p in rows" :key="p.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3 min-w-0">
                    <span class="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-600 dark:to-slate-700 text-white text-sm font-black flex items-center justify-center flex-shrink-0">{{ initial(p) }}</span>
                    <div class="min-w-0">
                      <p class="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{{ p.user?.name || '—' }}</p>
                      <p class="text-[11px] text-slate-400 truncate max-w-[180px]">{{ p.user?.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-black border" :class="purposeCls(p.purpose)">{{ t(`fines.payments.purpose.${p.purpose}`, p.purpose) }}</span>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                    <QrCodeIcon v-if="p.method === 'khqr'" class="w-4 h-4 text-indigo-500" />
                    <BanknotesIcon v-else class="w-4 h-4 text-amber-500" />
                    {{ p.method === 'khqr' ? 'KHQR' : t('fines.payments.cash') }}
                    <span v-if="p.provider === 'fake'" class="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[9px] font-black">TEST</span>
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span class="font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10">{{ p.tran_id }}</span>
                  <p v-if="p.apv" class="font-mono text-[10px] text-slate-400 mt-1">APV {{ p.apv }}</p>
                </td>
                <td class="px-5 py-4 whitespace-nowrap">
                  <p class="font-bold text-slate-800 dark:text-slate-200">{{ formatDate(p.paid_at || p.created_at) }}</p>
                  <p class="text-[11px] text-slate-400">{{ formatClock(p.paid_at || p.created_at) }}</p>
                </td>
                <td class="px-5 py-4 text-right whitespace-nowrap">
                  <span class="text-sm font-black" :class="p.status === 'refunded' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'">
                    {{ p.status === 'refunded' ? '− ' : '' }}{{ formatMoney(p.amount_khr ?? p.amount) }}<span v-if="p.currency === 'USD'" class="block text-[10px] font-bold text-slate-400">{{ t('fines.payments.chargedIn', { amount: formatIn(p.amount, 'USD') }) }}</span><span v-if="p.method === 'cash' && Number(p.cash_received_usd) > 0" class="block text-[10px] font-bold text-slate-400">{{ t('fines.cash.gotUsd', { usd: formatIn(p.cash_received_usd, 'USD'), change: (Number(p.change_usd) ? formatIn(p.change_usd, 'USD') + ' + ' : '') + formatIn(p.change_khr, 'KHR') }) }}</span>
                  </span>
                </td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border" :class="statusCls(p.status)">
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDot(p.status)"></span>
                    {{ t(`fines.payments.status.${p.status}`) }}
                  </span>
                </td>
                <td class="px-5 py-4 text-right">
                  <button v-if="['paid', 'refunded'].includes(p.status)" type="button" @click="receiptId = p.id" :title="t('fines.receipt.title')"
                    class="w-8 h-8 rounded-lg border border-slate-300 dark:border-white/15 inline-flex items-center justify-center text-slate-500 hover:text-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
                    <PrinterIcon class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============ CARD LIST (phones) ============ -->
      <div class="md:hidden space-y-3">
        <div v-for="p in rows" :key="p.id" class="relative overflow-hidden bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 pl-5 shadow-sm">
          <span class="absolute left-0 top-0 h-full w-1.5" :class="statusDot(p.status)"></span>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ p.user?.name || '—' }}</p>
              <p class="text-[11px] text-slate-400">{{ formatDate(p.paid_at || p.created_at) }} · {{ formatClock(p.paid_at || p.created_at) }}</p>
            </div>
            <span class="text-base font-black flex-shrink-0" :class="p.status === 'refunded' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'">
              {{ p.status === 'refunded' ? '− ' : '' }}{{ formatMoney(p.amount_khr ?? p.amount) }}<span v-if="p.currency === 'USD'" class="block text-[10px] font-bold text-slate-400">{{ t('fines.payments.chargedIn', { amount: formatIn(p.amount, 'USD') }) }}</span><span v-if="p.method === 'cash' && Number(p.cash_received_usd) > 0" class="block text-[10px] font-bold text-slate-400">{{ t('fines.cash.gotUsd', { usd: formatIn(p.cash_received_usd, 'USD'), change: (Number(p.change_usd) ? formatIn(p.change_usd, 'USD') + ' + ' : '') + formatIn(p.change_khr, 'KHR') }) }}</span>
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-2 mt-3">
            <span class="inline-flex px-2 py-0.5 rounded-lg text-[10px] font-black border" :class="purposeCls(p.purpose)">{{ t(`fines.payments.purpose.${p.purpose}`, p.purpose) }}</span>
            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              <QrCodeIcon v-if="p.method === 'khqr'" class="w-3.5 h-3.5 text-indigo-500" />
              <BanknotesIcon v-else class="w-3.5 h-3.5 text-amber-500" />
              {{ p.method === 'khqr' ? 'KHQR' : t('fines.payments.cash') }}
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ml-auto" :class="statusCls(p.status)">
              {{ t(`fines.payments.status.${p.status}`) }}
            </span>
          </div>
          <div class="flex items-center justify-between gap-2 mt-2">
            <p class="font-mono text-[10px] text-slate-400">{{ p.tran_id }}<span v-if="p.apv"> · APV {{ p.apv }}</span></p>
            <button v-if="['paid', 'refunded'].includes(p.status)" type="button" @click="receiptId = p.id" class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer">
              <PrinterIcon class="w-3.5 h-3.5" />{{ t('fines.receipt.title') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ PAGINATION ============ -->
    <div v-if="lastPage > 1" class="flex flex-wrap justify-center gap-2">
      <template v-for="(n, i) in visiblePages" :key="`${n}-${i}`">
        <span v-if="n === '…'" class="w-6 h-10 sm:h-9 flex items-center justify-center text-slate-400 text-xs font-bold select-none">…</span>
        <button
          v-else
          @click="load(n)"
          class="w-10 h-10 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          :class="n === page
            ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md'
            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
        >{{ n }}</button>
      </template>
    </div>

    <ReceiptModal v-if="receiptId" :payment-id="receiptId" @close="receiptId = null" />
    <CashClosingModal v-if="showClosing" @close="showClosing = false" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ReceiptPercentIcon, BanknotesIcon, QrCodeIcon, ArrowUturnLeftIcon,
  CheckBadgeIcon, MagnifyingGlassIcon, CalendarDaysIcon, PrinterIcon,
} from '@heroicons/vue/24/outline'
import ReceiptModal from '../components/ReceiptModal.vue'
import CashClosingModal from '../components/CashClosingModal.vue'
import { paymentService } from '../services/paymentService'
import { formatMoney, formatIn } from '@/utils/currencyHelper'

const { t } = useI18n()

const statuses = ['paid', 'pending', 'refunded', 'expired', 'failed', 'cancelled']
const purposes = ['fine', 'deposit', 'deposit_refund']
const inputCls =
  'w-full min-w-0 border border-slate-300 dark:border-white/15 rounded-xl py-3 sm:py-2.5 text-base sm:text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-emerald-600 shadow-2xs'

const filters = reactive({ search: '', method: '', purpose: '', status: '', from: '', to: '' })
const rows = ref([])
const summary = ref({})
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
const showDates = ref(false)
const receiptId = ref(null)
const showClosing = ref(false)
const period = ref('all')
let timer = null

const periods = computed(() => [
  { key: 'today', label: t('fines.payments.period.today') },
  { key: 'week', label: t('fines.payments.period.week') },
  { key: 'month', label: t('fines.payments.period.month') },
  { key: 'all', label: t('fines.payments.period.all') },
])

const cards = computed(() => [
  {
    key: 'total', icon: CheckBadgeIcon, badge: t('fines.payments.badgeReceived'),
    value: formatMoney(summary.value.paid_total),
    label: `${summary.value.paid_count ?? 0} ${t('fines.payments.paidCount')}`,
    cls: 'from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-900 border-emerald-500 dark:border-emerald-300/20',
  },
  {
    key: 'khqr', icon: QrCodeIcon, badge: 'KHQR',
    value: formatMoney(summary.value.khqr_total), label: t('fines.payments.viaKhqr'),
    cls: 'from-indigo-600 to-blue-700 dark:from-indigo-600 dark:to-blue-900 border-indigo-500 dark:border-indigo-300/20',
  },
  {
    key: 'cash', icon: BanknotesIcon, badge: t('fines.payments.cash'),
    value: formatMoney(summary.value.cash_total), label: t('fines.payments.atDesk'),
    cls: 'from-amber-500 to-orange-600 dark:from-amber-600 dark:to-orange-800 border-amber-400 dark:border-amber-300/20',
  },
  {
    key: 'refunded', icon: ArrowUturnLeftIcon, badge: t('fines.payments.badgeOut'),
    value: formatMoney(summary.value.refunded_total), label: t('fines.payments.refundedTotal'),
    cls: 'from-rose-500 to-rose-700 dark:from-rose-600 dark:to-rose-900 border-rose-400 dark:border-rose-300/20',
  },
])

const hasFilters = computed(() => Object.values(filters).some(Boolean))

const PURPOSE_CLS = {
  fine: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/30',
  deposit: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:border-sky-500/30',
  deposit_refund: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:border-violet-500/30',
}
const STATUS = {
  paid: ['bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800', 'bg-emerald-500'],
  pending: ['bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', 'bg-amber-500'],
  refunded: ['bg-violet-50 text-violet-700 border-violet-300 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800', 'bg-violet-500'],
}
const STATUS_OTHER = ['bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600', 'bg-slate-400']

const purposeCls = (p) => PURPOSE_CLS[p] || PURPOSE_CLS.fine
const statusCls = (s) => (STATUS[s] || STATUS_OTHER)[0]
const statusDot = (s) => (STATUS[s] || STATUS_OTHER)[1]
const initial = (p) => (p.user?.name || '?').trim().charAt(0).toUpperCase()

function formatDate(v) {
  return v ? new Date(v).toLocaleDateString('en-GB') : '—'
}
function formatClock(v) {
  return v ? new Date(v).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
}

// Windowed pagination: 1 … 4 5 6 … 20
const visiblePages = computed(() => {
  const last = lastPage.value
  const cur = page.value
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const nums = [...new Set([1, last, cur - 1, cur, cur + 1])].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b)
  const out = []
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
})

function iso(d) {
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function setPeriod(key) {
  period.value = key
  const today = new Date()
  if (key === 'today') {
    filters.from = iso(today)
    filters.to = iso(today)
  } else if (key === 'week') {
    filters.from = iso(new Date(today.getTime() - 6 * 86400000))
    filters.to = iso(today)
  } else if (key === 'month') {
    filters.from = iso(new Date(today.getFullYear(), today.getMonth(), 1))
    filters.to = iso(today)
  } else {
    filters.from = ''
    filters.to = ''
  }
  load(1)
}

function clearFilters() {
  Object.assign(filters, { search: '', method: '', purpose: '', status: '', from: '', to: '' })
  period.value = 'all'
  load(1)
}

async function load(n = 1) {
  loading.value = true
  try {
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    const { data } = await paymentService.list({ ...params, page: n })
    rows.value = data.data || []
    summary.value = data.summary || {}
    page.value = data.current_page || 1
    lastPage.value = data.last_page || 1
  } finally {
    loading.value = false
  }
}

function debouncedLoad() {
  clearTimeout(timer)
  timer = setTimeout(() => load(1), 400)
}

onMounted(load)
</script>
