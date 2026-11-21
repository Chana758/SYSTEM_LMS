<template>
  <!-- B5.4 (Sam): every payment, KHQR and cash, for checking money in and out -->
  <div class="space-y-4 sm:space-y-6 pb-12">
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm space-y-4">
      <div>
        <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{{ t('fines.payments.title') }}</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ t('fines.payments.subtitle') }}</p>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div v-for="card in cards" :key="card.key" class="rounded-2xl border border-slate-200 dark:border-white/10 p-4">
          <p class="text-[11px] font-bold text-slate-500 dark:text-slate-400">{{ card.label }}</p>
          <p class="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-1">{{ card.value }}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-6 gap-2">
        <input v-model="filters.search" @input="debouncedLoad" :placeholder="t('fines.payments.search')" :class="inputCls" class="col-span-2 lg:col-span-1" />
        <select v-model="filters.method" @change="load(1)" :class="inputCls">
          <option value="">{{ t('fines.payments.allMethods') }}</option>
          <option value="khqr">KHQR</option>
          <option value="cash">{{ t('fines.payments.cash') }}</option>
        </select>
        <select v-model="filters.purpose" @change="load(1)" :class="inputCls">
          <option value="">{{ t('fines.payments.allPurposes') }}</option>
          <option v-for="pp in purposes" :key="pp" :value="pp">{{ t(`fines.payments.purpose.${pp}`) }}</option>
        </select>
        <select v-model="filters.status" @change="load(1)" :class="inputCls">
          <option value="">{{ t('fines.payments.allStatus') }}</option>
          <option v-for="s in statuses" :key="s" :value="s">{{ t(`fines.payments.status.${s}`) }}</option>
        </select>
        <input v-model="filters.from" type="date" @change="load(1)" :class="inputCls" />
        <input v-model="filters.to" type="date" @change="load(1)" :class="inputCls" />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 dark:bg-slate-900/50 text-left text-[11px] uppercase tracking-wider text-slate-500">
          <tr>
            <th class="px-4 py-3">{{ t('fines.payments.date') }}</th>
            <th class="px-4 py-3">{{ t('fines.payments.member') }}</th>
            <th class="px-4 py-3">{{ t('fines.payments.purposeLabel') }}</th>
            <th class="px-4 py-3">{{ t('fines.payments.reference') }}</th>
            <th class="px-4 py-3">{{ t('fines.payments.method') }}</th>
            <th class="px-4 py-3 text-right">{{ t('fines.payments.amount') }}</th>
            <th class="px-4 py-3">{{ t('fines.payments.statusLabel') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading"><td colspan="7" class="px-4 py-10 text-center text-slate-400">…</td></tr>
          <tr v-else-if="!rows.length"><td colspan="7" class="px-4 py-10 text-center text-slate-400">{{ t('fines.payments.empty') }}</td></tr>
          <tr v-for="p in rows" :key="p.id" class="border-t border-slate-100 dark:border-white/5">
            <td class="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">{{ formatTime(p.paid_at || p.created_at) }}</td>
            <td class="px-4 py-3 font-bold text-slate-900 dark:text-white">{{ p.user?.name || '—' }}</td>
            <td class="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-300">{{ t(`fines.payments.purpose.${p.purpose}`, p.purpose) }}</td>
            <td class="px-4 py-3 font-mono text-xs text-slate-500">{{ p.tran_id }}<span v-if="p.apv"> · {{ p.apv }}</span></td>
            <td class="px-4 py-3">{{ p.method === 'khqr' ? 'KHQR' : t('fines.payments.cash') }}<span v-if="p.provider === 'fake'" class="ml-1 text-[10px] text-amber-600">TEST</span></td>
            <td class="px-4 py-3 text-right font-black" :class="p.status === 'refunded' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'">{{ p.status === 'refunded' ? '− ' : '' }}{{ formatKhr(p.amount) }}</td>
            <td class="px-4 py-3">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold" :class="badge(p.status)">{{ t(`fines.payments.status.${p.status}`) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="lastPage > 1" class="flex justify-center gap-2">
      <button v-for="n in lastPage" :key="n" @click="load(n)" class="w-9 h-9 rounded-lg text-xs font-bold cursor-pointer"
        :class="n === page ? 'bg-emerald-700 text-white' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/10'">{{ n }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { paymentService } from '../services/paymentService'
import { formatKhr } from '@/utils/currencyHelper'

const { t } = useI18n()
const statuses = ['paid', 'pending', 'refunded', 'expired', 'failed', 'cancelled']
const purposes = ['fine', 'deposit', 'deposit_refund']
const inputCls = 'h-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-base sm:text-sm outline-none focus:border-emerald-600'

const filters = reactive({ search: '', method: '', purpose: '', status: '', from: '', to: '' })
const rows = ref([])
const summary = ref({})
const page = ref(1)
const lastPage = ref(1)
const loading = ref(false)
let timer = null

const cards = computed(() => [
  { key: 'total', label: t('fines.payments.paidTotal'), value: formatKhr(summary.value.paid_total) },
  { key: 'count', label: t('fines.payments.paidCount'), value: summary.value.paid_count ?? 0 },
  { key: 'khqr', label: 'KHQR', value: formatKhr(summary.value.khqr_total) },
  { key: 'cash', label: t('fines.payments.cash'), value: formatKhr(summary.value.cash_total) },
  { key: 'refunded', label: t('fines.payments.refundedTotal'), value: formatKhr(summary.value.refunded_total) },
])

function badge(status) {
  return {
    paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300',
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  }[status] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString('en-GB') : '—'
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
