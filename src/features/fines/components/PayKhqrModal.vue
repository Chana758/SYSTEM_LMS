<template>
  <!-- B5.2 / B6.2 (Sam): pay a fine or a deposit by scanning a KHQR with any Cambodian bank app -->
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4" @click.self="close">
    <div class="w-full sm:max-w-sm bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 space-y-4 text-center">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-black text-slate-900 dark:text-white">{{ title || t('fines.khqr.title') }}</h2>
        <button type="button" @click="close" class="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer">
          <XMarkIcon class="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <!-- ៛ / $: which currency the QR charges (also changes how amounts are shown) -->
      <div v-if="state !== 'paid'" class="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
        <button
          v-for="c in ['KHR', 'USD']"
          :key="c"
          type="button"
          :disabled="state === 'loading'"
          @click="changeCurrency(c)"
          class="flex-1 py-2 rounded-lg text-xs font-black transition cursor-pointer disabled:opacity-60"
          :class="currency === c ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-slate-500 dark:text-slate-400'"
        >{{ c === 'KHR' ? t('fines.khqr.payInKhr') : t('fines.khqr.payInUsd') }}</button>
      </div>

      <!-- Loading -->
      <div v-if="state === 'loading'" class="py-16">
        <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>

      <!-- Error -->
      <div v-else-if="state === 'error'" class="py-8 space-y-3">
        <ExclamationTriangleIcon class="w-12 h-12 text-amber-500 mx-auto" />
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ error }}</p>
        <button type="button" @click="start" class="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer">{{ t('fines.khqr.retry') }}</button>
      </div>

      <!-- Paid: receipt -->
      <div v-else-if="state === 'paid'" class="py-4 space-y-3">
        <CheckCircleIcon class="w-16 h-16 text-emerald-600 mx-auto" />
        <p class="text-lg font-black text-slate-900 dark:text-white">{{ t('fines.khqr.paid') }}</p>
        <div class="text-left text-xs bg-slate-50 dark:bg-slate-900/60 rounded-xl p-3 space-y-1.5">
          <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.khqr.amount') }}</span><b>{{ formatIn(payment.amount, payment.currency) }}</b></p>
          <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.khqr.reference') }}</span><b class="font-mono">{{ payment.tran_id }}</b></p>
          <p v-if="payment.apv" class="flex justify-between"><span class="text-slate-500">APV</span><b class="font-mono">{{ payment.apv }}</b></p>
          <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.khqr.time') }}</span><b>{{ formatTime(payment.paid_at) }}</b></p>
        </div>
        <button type="button" @click="close" class="w-full h-11 rounded-xl bg-emerald-700 text-white text-sm font-bold cursor-pointer">{{ t('fines.khqr.done') }}</button>
      </div>

      <!-- Expired / failed -->
      <div v-else-if="state === 'ended'" class="py-8 space-y-3">
        <ClockIcon class="w-12 h-12 text-slate-400 mx-auto" />
        <p class="text-sm text-slate-600 dark:text-slate-300">{{ payment.status === 'expired' ? t('fines.khqr.expired') : t('fines.khqr.failed') }}</p>
        <button type="button" @click="start" class="px-5 py-2.5 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer">{{ t('fines.khqr.newQr') }}</button>
      </div>

      <!-- Waiting for scan -->
      <div v-else class="space-y-3">
        <div>
          <p class="text-2xl font-black text-slate-900 dark:text-white">{{ formatIn(payment.amount, payment.currency) }}</p>
          <p class="text-[11px] font-bold text-slate-400">
            ≈ {{ payment.currency === 'USD' ? formatIn(payment.amount_khr, 'KHR') : formatIn(payment.amount_khr / rate, 'USD') }}
            <span v-if="payment.currency === 'USD' && payment.exchange_rate"> · 1$ = {{ formatIn(payment.exchange_rate, 'KHR') }}</span>
          </p>
        </div>
        <div class="inline-block bg-white p-3 rounded-2xl border border-slate-200">
          <img v-if="qrImage" :src="qrImage" alt="KHQR" class="w-56 h-auto mx-auto" />
          <QrcodeVue v-else :value="payment.qr_string" :size="224" level="M" />
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('fines.khqr.scanHint') }}</p>
        <p class="text-xs font-bold" :class="secondsLeft < 60 ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'">
          {{ t('fines.khqr.expiresIn', { time: countdown }) }}
        </p>
        <a v-if="deeplink" :href="deeplink" class="block w-full h-11 leading-[2.75rem] rounded-xl bg-[#005d7f] text-white text-sm font-bold">
          {{ t('fines.khqr.openAba') }}
        </a>
        <p class="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{{ t('fines.khqr.waiting') }}
        </p>

        <!-- Test mode only (PAYMENT_DRIVER=fake): staff can simulate the bank -->
        <div v-if="payment.test_mode" class="rounded-xl border border-dashed border-amber-400 p-3 space-y-2">
          <p class="text-[11px] font-bold text-amber-700 dark:text-amber-300">{{ t('fines.khqr.testMode') }}</p>
          <button v-if="isStaff" type="button" @click="simulate" class="w-full h-9 rounded-lg bg-amber-500 text-white text-xs font-bold cursor-pointer">
            {{ t('fines.khqr.simulate') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import QrcodeVue from 'qrcode.vue'
import { XMarkIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { paymentService } from '../services/paymentService'
import { useAuthStore } from '@/features/auth/store/authStore'
import { formatIn } from '@/utils/currencyHelper'
import { useCurrencyStore } from '@/stores/currencyStore'

// Pass either a fine, or the member id whose deposit is being paid
const props = defineProps({
  fine: { type: Object, default: null },
  depositMemberId: { type: [Number, String], default: null },
  title: { type: String, default: '' },
})
const emit = defineEmits(['close', 'paid'])

const POLL_MS = 4000

const { t } = useI18n()
const authStore = useAuthStore()
const isStaff = computed(() => ['admin', 'librarian'].includes(authStore.role))

// Starts with the top-bar choice; switching here regenerates the QR and updates the top bar too
const currencyStore = useCurrencyStore()
const currency = ref(currencyStore.currency)
const rate = computed(() => payment.value?.exchange_rate || currencyStore.rate)

function changeCurrency(c) {
  if (c === currency.value) return
  currency.value = c
  currencyStore.set(c)
  start()
}

const state = ref('loading') // loading | waiting | paid | ended | error
const payment = ref(null)
const qrImage = ref(null)
const deeplink = ref(null)
const error = ref('')
const now = ref(Date.now())
let pollTimer = null
let clockTimer = null

const secondsLeft = computed(() => {
  if (!payment.value?.expires_at) return 0
  return Math.max(0, Math.floor((new Date(payment.value.expires_at).getTime() - now.value) / 1000))
})
const countdown = computed(() => {
  const s = secondsLeft.value
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})

function formatTime(value) {
  return value ? new Date(value).toLocaleString('en-GB') : ''
}

function apply(data) {
  payment.value = data
  if (data.qr_image) qrImage.value = data.qr_image
  if (data.deeplink) deeplink.value = data.deeplink

  if (data.status === 'paid') {
    state.value = 'paid'
    stopPolling()
    emit('paid', data)
  } else if (data.status === 'pending') {
    state.value = 'waiting'
  } else {
    state.value = 'ended'
    stopPolling()
  }
}

async function start() {
  stopPolling()
  state.value = 'loading'
  qrImage.value = null
  deeplink.value = null
  try {
    const { data } = props.fine
      ? await paymentService.payFineByKhqr(props.fine.id, currency.value)
      : await paymentService.payDepositByKhqr(props.depositMemberId, currency.value)
    apply(data)
    if (state.value === 'waiting') pollTimer = setInterval(poll, POLL_MS)
  } catch (e) {
    const res = e.response?.data
    error.value = (res?.errors && Object.values(res.errors)[0]?.[0]) || res?.message || t('fines.khqr.genericError')
    state.value = 'error'
  }
}

async function poll() {
  if (!payment.value) return
  try {
    const { data } = await paymentService.status(payment.value.id)
    apply(data)
  } catch {
    // keep polling; a missed poll is fine
  }
}

async function simulate() {
  const { data } = await paymentService.simulatePaid(payment.value.id)
  apply(data)
}

function stopPolling() {
  clearInterval(pollTimer)
  pollTimer = null
}

function close() {
  stopPolling()
  emit('close')
}

onMounted(() => {
  start()
  clockTimer = setInterval(() => { now.value = Date.now() }, 1000)
})

onBeforeUnmount(() => {
  stopPolling()
  clearInterval(clockTimer)
})
</script>
