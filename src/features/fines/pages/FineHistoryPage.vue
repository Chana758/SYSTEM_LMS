<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 shadow-md dark:shadow-black/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          💰
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('fines.pageTitle') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('fines.pageSubtitle') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <!-- Points directly at the full-featured Fine Report inside the
             Admin Reports module. /fines/report still exists and redirects
             here too, for anyone with it bookmarked. -->
        <router-link
          to="/reports/fine"
          class="border-2 border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center gap-1.5"
        >
          <span>📊</span> {{ t('fines.viewReport') }}
        </router-link>
        <router-link
          to="/fines/create"
          class="bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          <span>+</span> {{ t('fines.addFine') }}
        </router-link>
      </div>
    </div>

    <!-- Summary Cards -->
    <FineSummaryCard :summary="store.summary" />

    <!-- Filters & Main Table Container Unified -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 shadow-md dark:shadow-black/30 space-y-6 transition-colors">
      <FineFilter v-model="store.filters" @change="store.fetchFines(1)" />
      <FineTable :fines="store.fines" :loading="store.loading" @pay="openPay" @waive="openWaive" @view="goDetail" @edit="goEdit" />
    </div>

    <!-- Pagination -->
    <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchFines(p)"
        class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
        :class="p === store.pagination.current_page
          ? 'bg-emerald-600 text-white'
          : 'bg-white dark:bg-slate-800/50 border-2 border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-white/5'"
      >
        {{ p }}
      </button>
    </div>

    <!-- Pay Modal (simpler: big amount, tap a method, one confirm) -->
    <PayFineModal
      v-if="payTarget"
      :fine="payTarget"
      :processing="paymentStore.processing"
      :error="paymentStore.errors.general || ''"
      @confirm="confirmPay"
      @cancel="payTarget = null"
    />

    <!-- Waive Modal -->
    <Teleport to="body">
      <div v-if="waiveTarget" class="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-6 md:p-8 w-full max-w-sm shadow-xl dark:shadow-black/50 space-y-5">
          <div class="w-12 h-12 bg-amber-50 dark:bg-amber-500/15 border-2 border-amber-200 dark:border-amber-400/25 rounded-xl flex items-center justify-center shadow-2xs">
            <HandRaisedIcon class="w-6 h-6 text-amber-600 dark:text-amber-300" />
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ t('fines.waiveFineTitle') }}</h2>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('fines.amount') }}: <span class="font-extrabold text-slate-900 dark:text-white">${{ Number(waiveTarget.amount).toFixed(2) }}</span></p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('fines.reasonLabel') }}</label>
            <textarea
              v-model="waiveNotes"
              rows="3"
              :placeholder="t('fines.waiveReasonPlaceholder')"
              class="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:border-amber-500 focus:outline-hidden transition-colors shadow-2xs resize-none"
            ></textarea>
          </div>

          <p v-if="paymentStore.errors.general" class="text-xs font-bold text-rose-500 dark:text-rose-400">{{ paymentStore.errors.general }}</p>

          <div class="flex gap-3 pt-2">
            <button
              @click="waiveTarget = null"
              class="flex-1 border-2 border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs"
            >
              {{ t('fines.cancel') }}
            </button>
            <button
              @click="confirmWaive"
              :disabled="paymentStore.processing"
              class="flex-1 bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-500 text-white py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ paymentStore.processing ? t('fines.processing') : t('fines.confirmWaive') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { HandRaisedIcon } from '@heroicons/vue/24/outline'
import { useFineStore } from '../store/fineStore'
import { useFinePaymentStore } from '../store/finePaymentStore'
import FineSummaryCard from '../components/FineSummaryCard.vue'
import FineFilter from '../components/FineFilter.vue'
import FineTable from '../components/FineTable.vue'
import PayFineModal from '../components/PayFineModal.vue'

const { t } = useI18n()
const router = useRouter()
const store = useFineStore()
const paymentStore = useFinePaymentStore()

const payTarget = ref(null)
const waiveTarget = ref(null)
const waiveNotes = ref('')

function openPay(fine) {
  paymentStore.errors = {}
  payTarget.value = fine
}
function openWaive(fine) {
  paymentStore.errors = {}
  waiveTarget.value = fine
  waiveNotes.value = ''
}
function goDetail(fine) { router.push({ name: 'fine-detail', params: { id: fine.id } }) }
function goEdit(fine) { router.push({ name: 'fine-edit', params: { id: fine.id } }) }

async function confirmPay(method) {
  const result = await paymentStore.payFine(payTarget.value.id, method)
  if (result.success) {
    payTarget.value = null
    store.fetchFines(store.pagination.current_page)
    store.fetchSummary()
  }
}

async function confirmWaive() {
  const result = await paymentStore.waiveFine(waiveTarget.value.id, waiveNotes.value)
  if (result.success) {
    waiveTarget.value = null
    store.fetchFines(store.pagination.current_page)
    store.fetchSummary()
  }
}

onMounted(() => {
  store.fetchFines()
  store.fetchSummary()
})
</script>