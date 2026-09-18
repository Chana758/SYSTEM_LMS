<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          💰
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('fines.pageTitle') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('fines.pageSubtitle') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-2.5">
        <!-- FIX: points directly at the full-featured Fine Report inside
             the Admin Reports module (date filters, table, export) —
             /fines/report was a bare "coming soon" placeholder that
             duplicated work already done there. /fines/report still
             exists and now redirects here too, for anyone with it
             bookmarked. -->
        <router-link 
          to="/reports/fine" 
          class="border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center gap-1.5"
        >
          <span>📊</span> {{ t('fines.viewReport') }}
        </router-link>
        <router-link 
          to="/fines/create" 
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-sm inline-flex items-center gap-1.5"
        >
          <span>+</span> {{ t('fines.addFine') }}
        </router-link>
      </div>
    </div>

    <!-- Summary Cards -->
    <FineSummaryCard :summary="store.summary" />

    <!-- Filters & Main Table Container Unified -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-md space-y-6">
      <FineFilter v-model="store.filters" @change="store.fetchFines(1)" />
      <FineTable :fines="store.fines" :loading="store.loading" @pay="openPay" @waive="openWaive" @view="goDetail" @edit="goEdit" />
    </div>

    <!-- Pagination -->
    <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
      <button 
        v-for="p in store.pagination.last_page" :key="p" 
        @click="store.fetchFines(p)"
        class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs"
        :class="p === store.pagination.current_page ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-emerald-50'"
      >
        {{ p }}
      </button>
    </div>

    <!-- Pay Modal -->
    <Teleport to="body">
      <div v-if="payTarget" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 w-full max-w-sm shadow-xl space-y-5">
          <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center shadow-2xs">
            <BanknotesIcon class="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ t('fines.confirmPayment') }}</h2>
            <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('fines.amountDue') }} <span class="font-extrabold text-slate-900">${{ Number(payTarget.amount).toFixed(2) }}</span></p>
          </div>
          
          <div class="space-y-1.5">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">{{ t('fines.paymentMethod') }}</label>
            <select 
              v-model="paymentMethod" 
              class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-extrabold text-slate-700 focus:bg-white focus:border-emerald-600 focus:outline-hidden transition-colors shadow-2xs cursor-pointer"
            >
              <option value="cash">{{ t('fines.methodCash') }}</option>
              <option value="card">{{ t('fines.methodCard') }}</option>
              <option value="bank_transfer">{{ t('fines.methodBankTransfer') }}</option>
              <option value="other">{{ t('fines.methodOther') }}</option>
            </select>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              @click="payTarget = null" 
              class="flex-1 border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs"
            >
              {{ t('fines.cancel') }}
            </button>
            <button 
              @click="confirmPay" 
              :disabled="paymentStore.processing" 
              class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-sm"
            >
              {{ paymentStore.processing ? t('fines.processing') : t('fines.confirmPaymentBtn') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Waive Modal -->
    <Teleport to="body">
      <div v-if="waiveTarget" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 w-full max-w-sm shadow-xl space-y-5">
          <div class="w-12 h-12 bg-amber-50 border-2 border-amber-200 rounded-xl flex items-center justify-center shadow-2xs">
            <HandRaisedIcon class="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ t('fines.waiveFineTitle') }}</h2>
            <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('fines.amount') }}: <span class="font-extrabold text-slate-900">${{ Number(waiveTarget.amount).toFixed(2) }}</span></p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[10px] font-black uppercase tracking-widest text-slate-400">{{ t('fines.reasonLabel') }}</label>
            <textarea 
              v-model="waiveNotes" 
              rows="3" 
              :placeholder="t('fines.waiveReasonPlaceholder')" 
              class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl p-3 text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:outline-hidden transition-colors shadow-2xs resize-none"
            ></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button 
              @click="waiveTarget = null" 
              class="flex-1 border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-100 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs"
            >
              {{ t('fines.cancel') }}
            </button>
            <button 
              @click="confirmWaive" 
              :disabled="paymentStore.processing" 
              class="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-sm"
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
import { BanknotesIcon, HandRaisedIcon } from '@heroicons/vue/24/outline'
import { useFineStore } from '../store/fineStore'
import { useFinePaymentStore } from '../store/finePaymentStore'
import FineSummaryCard from '../components/FineSummaryCard.vue'
import FineFilter from '../components/FineFilter.vue'
import FineTable from '../components/FineTable.vue'

const { t } = useI18n()
const router = useRouter()
const store = useFineStore()
const paymentStore = useFinePaymentStore()

const payTarget = ref(null)
const waiveTarget = ref(null)
const paymentMethod = ref('cash')
const waiveNotes = ref('')

function openPay(fine) { payTarget.value = fine; paymentMethod.value = 'cash' }
function openWaive(fine) { waiveTarget.value = fine; waiveNotes.value = '' }
function goDetail(fine) { router.push({ name: 'fine-detail', params: { id: fine.id } }) }
// NEW — was previously unreachable from anywhere in the UI.
function goEdit(fine) { router.push({ name: 'fine-edit', params: { id: fine.id } }) }

async function confirmPay() {
  const result = await paymentStore.payFine(payTarget.value.id, paymentMethod.value)
  if (result.success) { payTarget.value = null; store.fetchFines(store.pagination.current_page); store.fetchSummary() }
}

async function confirmWaive() {
  const result = await paymentStore.waiveFine(waiveTarget.value.id, waiveNotes.value)
  if (result.success) { waiveTarget.value = null; store.fetchFines(store.pagination.current_page); store.fetchSummary() }
}

onMounted(() => {
  store.fetchFines()
  store.fetchSummary()
})
</script>