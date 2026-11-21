<template>
  <!-- B6.2 (Sam): the member's own deposit on My Profile -->
  <div v-if="deposit && deposit.deposit_status !== 'none'" class="space-y-3">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ t('fines.deposit.title') }}</h2>
        <p class="text-sm text-gray-400 dark:text-slate-400">{{ t('fines.deposit.subtitle') }}</p>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-black" :class="badge">{{ t(`fines.deposit.status.${deposit.deposit_status}`) }}</span>
    </div>

    <div class="rounded-2xl bg-slate-50 dark:bg-slate-900/60 p-4 flex items-center justify-between">
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ t('fines.deposit.amount') }}</span>
      <span class="text-xl font-black text-slate-900 dark:text-white">{{ formatMoney(deposit.deposit_amount) }}</span>
    </div>

    <template v-if="deposit.deposit_status === 'unpaid'">
      <p class="text-xs text-rose-600 dark:text-rose-400 font-semibold">{{ t('fines.deposit.mustPay') }}</p>
      <button type="button" @click="paying = true"
        class="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-black inline-flex items-center justify-center gap-2 cursor-pointer">
        <QrCodeIcon class="w-5 h-5" />{{ t('fines.khqr.payButton') }}
      </button>
    </template>

    <p v-else-if="deposit.deposit_status === 'paid'" class="text-xs text-slate-500 dark:text-slate-400">
      {{ t('fines.deposit.paidOn', { date: formatDate(deposit.deposit_paid_at) }) }} · {{ t('fines.deposit.refundHint') }}
    </p>

    <p v-else-if="deposit.deposit_status === 'refunded'" class="text-xs text-slate-500 dark:text-slate-400">
      {{ t('fines.deposit.refundedInfo', { refund: formatMoney(deposit.deposit_refunded), deducted: formatMoney(deposit.deposit_deducted) }) }}
    </p>

    <PayKhqrModal v-if="paying" :deposit-member-id="deposit.member_id" :title="t('fines.deposit.payTitle')" @close="paying = false" @paid="load" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { QrCodeIcon } from '@heroicons/vue/24/outline'
import PayKhqrModal from '@/features/fines/components/PayKhqrModal.vue'
import { paymentService } from '@/features/fines/services/paymentService'
import { formatMoney } from '@/utils/currencyHelper'

const { t } = useI18n()
const deposit = ref(null)
const paying = ref(false)

const badge = computed(() => ({
  unpaid: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  refunded: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}[deposit.value?.deposit_status] || ''))

function formatDate(v) {
  return v ? new Date(v).toLocaleDateString('en-GB') : ''
}

async function load() {
  try {
    const { data } = await paymentService.myDeposit()
    deposit.value = data
  } catch {
    deposit.value = null
  }
}

onMounted(load)
</script>
