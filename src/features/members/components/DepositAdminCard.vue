<template>
  <!-- B6.2 / B6.4 (Sam): staff view of a member's deposit: ask, take cash/KHQR, refund minus fines -->
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-3">
    <div class="flex items-center justify-between gap-2">
      <h3 class="text-sm font-black text-slate-900 dark:text-white">{{ t('fines.deposit.title') }}</h3>
      <span v-if="d" class="px-2.5 py-1 rounded-full text-[11px] font-black" :class="badge">{{ t(`fines.deposit.status.${d.deposit_status}`) }}</span>
    </div>

    <template v-if="d">
      <p v-if="d.deposit_status !== 'none'" class="text-2xl font-black text-slate-900 dark:text-white">{{ formatKhr(d.deposit_amount) }}</p>

      <!-- none: ask for the deposit of this member's type -->
      <div v-if="d.deposit_status === 'none'" class="space-y-2">
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('fines.deposit.noneHint') }}</p>
        <button type="button" :disabled="busy" @click="run('requireDeposit')" :class="btnLight">{{ t('fines.deposit.require') }}</button>
      </div>

      <!-- unpaid: cash at the desk, or show a KHQR for the member to scan -->
      <div v-else-if="d.deposit_status === 'unpaid'" class="grid grid-cols-2 gap-2">
        <button type="button" :disabled="busy" @click="confirmCash" :class="btnLight">{{ t('fines.deposit.cash') }}</button>
        <button type="button" :disabled="busy" @click="paying = true" :class="btnGreen">KHQR</button>
      </div>

      <!-- paid: refund (unpaid fines are taken out first) -->
      <div v-else-if="d.deposit_status === 'paid'" class="space-y-2">
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('fines.deposit.paidOn', { date: formatDate(d.deposit_paid_at) }) }}</p>
        <div v-if="d.refund_preview" class="text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 space-y-1">
          <p class="flex justify-between"><span>{{ t('fines.deposit.unpaidFines') }}</span><b>{{ formatKhr(d.refund_preview.unpaid_fines) }}</b></p>
          <p class="flex justify-between"><span>{{ t('fines.deposit.deducted') }}</span><b>− {{ formatKhr(d.refund_preview.deducted) }}</b></p>
          <p class="flex justify-between text-sm"><span class="font-bold">{{ t('fines.deposit.refundAmount') }}</span><b class="text-emerald-700 dark:text-emerald-300">{{ formatKhr(d.refund_preview.refund) }}</b></p>
        </div>
        <button type="button" :disabled="busy" @click="confirmRefund" :class="btnLight">{{ t('fines.deposit.refund') }}</button>
      </div>

      <!-- refunded -->
      <div v-else class="space-y-2">
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('fines.deposit.refundedInfo', { refund: formatKhr(d.deposit_refunded), deducted: formatKhr(d.deposit_deducted) }) }}</p>
        <button type="button" :disabled="busy" @click="run('requireDeposit')" :class="btnLight">{{ t('fines.deposit.require') }}</button>
      </div>
    </template>

    <p v-if="error" class="text-xs font-semibold text-red-600">{{ error }}</p>

    <PayKhqrModal v-if="paying" :deposit-member-id="memberId" :title="t('fines.deposit.payTitle')" @close="paying = false; load()" @paid="load" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import PayKhqrModal from '@/features/fines/components/PayKhqrModal.vue'
import { paymentService } from '@/features/fines/services/paymentService'
import { formatKhr } from '@/utils/currencyHelper'

const props = defineProps({
  memberId: { type: [Number, String], required: true },
})

const { t } = useI18n()
const toast = useToast()
const d = ref(null)
const busy = ref(false)
const error = ref('')
const paying = ref(false)

const btnLight = 'w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-50 cursor-pointer'
const btnGreen = 'w-full px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50 cursor-pointer'

const badge = computed(() => ({
  none: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300',
  unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  refunded: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}[d.value?.deposit_status] || ''))

function formatDate(v) {
  return v ? new Date(v).toLocaleDateString('en-GB') : ''
}

async function load() {
  const { data } = await paymentService.deposit(props.memberId)
  d.value = data
}

async function run(action) {
  busy.value = true
  error.value = ''
  try {
    const { data } = await paymentService[action](props.memberId)
    if (data.message) toast.success(data.message)
    await load()
  } catch (e) {
    const res = e.response?.data
    error.value = (res?.errors && Object.values(res.errors)[0]?.[0]) || res?.message || 'Error'
  } finally {
    busy.value = false
  }
}

function confirmCash() {
  if (window.confirm(t('fines.deposit.cashConfirm', { amount: formatKhr(d.value.deposit_amount) }))) run('depositCash')
}

function confirmRefund() {
  if (window.confirm(t('fines.deposit.refundConfirm', { amount: formatKhr(d.value.refund_preview?.refund) }))) run('refundDeposit')
}

onMounted(load)
</script>
