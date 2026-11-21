<template>
  <!-- End-of-day cash close: count the drawer (៛ and $) and compare with the system -->
  <div class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4" @click.self="$emit('close')">
    <div class="w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 space-y-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h2 class="text-lg font-black text-slate-900 dark:text-white">{{ t('fines.closing.title') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ t('fines.closing.subtitle') }}</p>
        </div>
        <button type="button" @click="$emit('close')" class="w-9 h-9 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center cursor-pointer"><XMarkIcon class="w-5 h-5 text-slate-500" /></button>
      </div>

      <div class="flex items-center gap-2">
        <input v-model="date" type="date" :max="today" @change="load" class="h-10 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-sm font-bold dark:[color-scheme:dark]" />
        <span v-if="info" class="text-xs font-bold text-slate-500">{{ info.staff?.name }} · {{ t('fines.closing.count', { n: info.payments_count }) }}</span>
      </div>

      <div v-if="!info" class="py-10"><div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div></div>

      <template v-else>
        <!-- What the system expects -->
        <div class="rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-4 text-xs space-y-1.5">
          <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.closing.receivedKhr') }}</span><b>{{ formatIn(info.received_khr, 'KHR') }}</b></p>
          <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.closing.change') }}</span><b>− {{ formatIn(info.change_khr, 'KHR') }}</b></p>
          <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.closing.refunds') }}</span><b>− {{ formatIn(info.refunded_khr, 'KHR') }}</b></p>
          <p class="flex justify-between text-sm pt-1.5 border-t border-slate-200 dark:border-white/10"><span class="font-bold">{{ t('fines.closing.expected') }} ៛</span><b class="text-slate-900 dark:text-white">{{ formatIn(info.expected_khr, 'KHR') }}</b></p>
          <p class="flex justify-between text-sm"><span class="font-bold">{{ t('fines.closing.expected') }} $</span><b class="text-slate-900 dark:text-white">{{ formatIn(info.expected_usd, 'USD') }}</b></p>
        </div>

        <!-- Already closed: read only -->
        <div v-if="info.closing" class="rounded-2xl border-2 p-4 text-xs space-y-1.5" :class="hasDiff(info.closing) ? 'border-rose-300 dark:border-rose-400/30' : 'border-emerald-300 dark:border-emerald-400/30'">
          <p class="font-black text-slate-900 dark:text-white">{{ t('fines.closing.done') }}</p>
          <p class="flex justify-between"><span>{{ t('fines.closing.counted') }}</span><b>{{ formatIn(info.closing.counted_khr, 'KHR') }} · {{ formatIn(info.closing.counted_usd, 'USD') }}</b></p>
          <p class="flex justify-between" :class="diffCls(info.closing.diff_khr)"><span>{{ t('fines.closing.diff') }} ៛</span><b>{{ sign(info.closing.diff_khr) }}{{ formatIn(Math.abs(info.closing.diff_khr), 'KHR') }}</b></p>
          <p class="flex justify-between" :class="diffCls(info.closing.diff_usd)"><span>{{ t('fines.closing.diff') }} $</span><b>{{ sign(info.closing.diff_usd) }}{{ formatIn(Math.abs(info.closing.diff_usd), 'USD') }}</b></p>
          <p v-if="info.closing.note" class="text-slate-500">“{{ info.closing.note }}”</p>
        </div>

        <!-- Count now -->
        <form v-else @submit.prevent="save" class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <label class="block"><span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{{ t('fines.closing.countedKhr') }}</span>
              <input v-model.number="countedKhr" type="number" min="0" step="100" required :class="inputCls" /></label>
            <label class="block"><span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{{ t('fines.closing.countedUsd') }}</span>
              <input v-model.number="countedUsd" type="number" min="0" step="0.01" required :class="inputCls" /></label>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs font-black">
            <p class="rounded-xl px-3 py-2 text-center" :class="diffBox(diffKhr)">{{ t('fines.closing.diff') }} ៛ {{ sign(diffKhr) }}{{ formatIn(Math.abs(diffKhr), 'KHR') }}</p>
            <p class="rounded-xl px-3 py-2 text-center" :class="diffBox(diffUsd)">{{ t('fines.closing.diff') }} $ {{ sign(diffUsd) }}{{ formatIn(Math.abs(diffUsd), 'USD') }}</p>
          </div>
          <textarea v-if="diffKhr !== 0 || diffUsd !== 0" v-model="note" rows="2" required :placeholder="t('fines.closing.notePlaceholder')" :class="[inputCls, 'h-auto py-2']"></textarea>
          <p v-if="error" class="text-xs font-semibold text-rose-600">{{ error }}</p>
          <button type="submit" :disabled="busy" class="w-full h-11 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold disabled:opacity-50 cursor-pointer">{{ t('fines.closing.save') }}</button>
          <p class="text-[11px] text-slate-400 text-center">{{ t('fines.closing.onceHint') }}</p>
        </form>

        <!-- Recent closes -->
        <div v-if="history.length" class="space-y-1.5">
          <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ t('fines.closing.recent') }}</p>
          <div v-for="c in history" :key="c.id" class="flex items-center justify-between text-xs rounded-xl bg-slate-50 dark:bg-slate-900/60 px-3 py-2">
            <span class="font-bold text-slate-700 dark:text-slate-200">{{ c.date }} · {{ c.user?.name }}</span>
            <span v-if="hasDiff(c)" class="font-black text-rose-600 dark:text-rose-400">{{ sign(c.diff_khr) }}{{ formatIn(Math.abs(c.diff_khr), 'KHR') }} · {{ sign(c.diff_usd) }}{{ formatIn(Math.abs(c.diff_usd), 'USD') }}</span>
            <span v-else class="font-black text-emerald-700 dark:text-emerald-300">✓ {{ t('fines.closing.match') }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { paymentService } from '../services/paymentService'
import { formatIn } from '@/utils/currencyHelper'

defineEmits(['close'])
const { t } = useI18n()
const toast = useToast()

const pad = (n) => String(n).padStart(2, '0')
const d0 = new Date()
const today = `${d0.getFullYear()}-${pad(d0.getMonth() + 1)}-${pad(d0.getDate())}`

const date = ref(today)
const info = ref(null)
const history = ref([])
const countedKhr = ref(0)
const countedUsd = ref(0)
const note = ref('')
const busy = ref(false)
const error = ref('')

const inputCls = 'w-full h-11 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-base sm:text-sm font-bold outline-none focus:border-emerald-600'

const diffKhr = computed(() => Math.round((Number(countedKhr.value) || 0) - (info.value?.expected_khr || 0)))
const diffUsd = computed(() => Math.round(((Number(countedUsd.value) || 0) - (info.value?.expected_usd || 0)) * 100) / 100)

const sign = (n) => (Number(n) > 0 ? '+ ' : Number(n) < 0 ? '− ' : '')
const hasDiff = (c) => Number(c.diff_khr) !== 0 || Number(c.diff_usd) !== 0
const diffCls = (n) => (Number(n) === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-400')
const diffBox = (n) => (n === 0 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300')

async function load() {
  info.value = null
  error.value = ''
  const [{ data }, list] = await Promise.all([
    paymentService.cashClosing({ date: date.value }),
    paymentService.cashClosings().catch(() => ({ data: [] })),
  ])
  info.value = data
  history.value = (list.data || []).slice(0, 7)
  countedKhr.value = data.expected_khr
  countedUsd.value = data.expected_usd
  note.value = ''
}

async function save() {
  busy.value = true
  error.value = ''
  try {
    const { data } = await paymentService.saveCashClosing({ date: date.value, counted_khr: countedKhr.value, counted_usd: countedUsd.value, note: note.value })
    toast.success(data.message)
    await load()
  } catch (e) {
    const res = e.response?.data
    error.value = (res?.errors && Object.values(res.errors)[0]?.[0]) || res?.message || 'Error'
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
