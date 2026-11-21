<template>
  <!-- Cash at the desk in ៛ and/or $ (Cambodia mixes both); change is given in ៛ -->
  <div class="space-y-2.5">
    <div class="grid grid-cols-2 gap-2">
      <label class="block">
        <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{{ t('fines.cash.receivedKhr') }}</span>
        <div class="relative">
          <input v-model.number="khr" type="number" min="0" step="100" inputmode="numeric" :class="inputCls" placeholder="0" />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">៛</span>
        </div>
      </label>
      <label class="block">
        <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{{ t('fines.cash.receivedUsd') }}</span>
        <div class="relative">
          <input v-model.number="usd" type="number" min="0" step="0.01" inputmode="decimal" :class="inputCls" placeholder="0.00" />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">$</span>
        </div>
      </label>
    </div>

    <!-- Quick fill -->
    <div class="flex flex-wrap gap-1.5">
      <button type="button" @click="exactKhr" :class="chip">{{ t('fines.cash.exact') }} {{ formatIn(amountKhr, 'KHR') }}</button>
      <button type="button" @click="exactUsd" :class="chip">{{ t('fines.cash.exact') }} {{ formatIn(usdNeeded, 'USD') }}</button>
      <button v-for="note in usdNotes" :key="note" type="button" @click="setUsd(note)" :class="chip">${{ note }}</button>
    </div>

    <div class="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 p-3 text-xs space-y-1.5">
      <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.cash.owed') }}</span><b class="text-slate-900 dark:text-white">{{ formatIn(amountKhr, 'KHR') }}</b></p>
      <p class="flex justify-between"><span class="text-slate-500">{{ t('fines.cash.total') }}</span>
        <b class="text-slate-900 dark:text-white">{{ formatIn(totalKhr, 'KHR') }}<span v-if="usd > 0" class="font-semibold text-slate-400"> (1$ = {{ formatIn(rate, 'KHR') }})</span></b></p>
      <p v-if="short > 0" class="flex justify-between text-rose-600 dark:text-rose-400 font-black"><span>{{ t('fines.cash.short') }}</span><span>{{ formatIn(short, 'KHR') }}</span></p>
      <template v-else>
        <!-- Give change in Riel, or in dollars + the rest in Riel -->
        <div v-if="changeTotal >= rate" class="flex items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-white/10">
          <span class="text-slate-500">{{ t('fines.cash.changeIn') }}</span>
          <div class="flex p-0.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10">
            <button v-for="m in ['KHR', 'USD']" :key="m" type="button" @click="changeIn = m"
              class="px-2.5 py-1 rounded-md text-[11px] font-black cursor-pointer"
              :class="changeIn === m ? 'bg-emerald-600 text-white' : 'text-slate-500'">{{ m === 'KHR' ? '៛' : '$ + ៛' }}</button>
          </div>
        </div>
        <p class="flex justify-between text-sm font-black text-emerald-700 dark:text-emerald-300 pt-1 border-t border-slate-200 dark:border-white/10">
          <span>{{ t('fines.cash.changeGive') }}</span><span>{{ changeLabel }}</span>
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatIn } from '@/utils/currencyHelper'
import { useCurrencyStore } from '@/stores/currencyStore'

const props = defineProps({
  amountKhr: { type: Number, required: true },
})
// { received_khr, received_usd, valid }
const emit = defineEmits(['update:modelValue'])

const { t } = useI18n()
const currencyStore = useCurrencyStore()
const rate = computed(() => currencyStore.rate)

const khr = ref(props.amountKhr)
const usd = ref(0)

const inputCls = 'w-full h-11 rounded-xl border-2 border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pl-3 pr-8 text-base sm:text-sm font-bold outline-none focus:border-emerald-600'
const chip = 'px-2.5 py-1 rounded-lg border border-slate-300 dark:border-white/15 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer'

const usdNeeded = computed(() => Math.ceil((props.amountKhr / rate.value) * 100) / 100)
const usdNotes = computed(() => [1, 5, 10].filter((n) => n >= usdNeeded.value).slice(0, 2))
const totalKhr = computed(() => (Number(khr.value) || 0) + (Number(usd.value) || 0) * rate.value)
const short = computed(() => Math.max(0, Math.ceil(props.amountKhr - totalKhr.value)))
// Same rule as the server (PaymentService::splitChange)
const changeIn = ref('KHR')
const changeTotal = computed(() => (short.value > 0 ? 0 : totalKhr.value - props.amountKhr))
const changeSplit = computed(() => {
  const c = Math.max(0, changeTotal.value)
  if (changeIn.value === 'USD') {
    const usd = Math.floor((c + 0.5) / rate.value)
    return { usd, khr: Math.max(0, Math.floor((c - usd * rate.value) / 100) * 100) }
  }
  return { usd: 0, khr: Math.floor(c / 100) * 100 }
})
const changeLabel = computed(() => {
  const { usd, khr } = changeSplit.value
  const parts = []
  if (usd > 0) parts.push(formatIn(usd, 'USD'))
  if (khr > 0 || !usd) parts.push(formatIn(khr, 'KHR'))
  return parts.join(' + ')
})

function exactKhr() { khr.value = props.amountKhr; usd.value = 0 }
function exactUsd() { khr.value = 0; usd.value = usdNeeded.value }
function setUsd(n) { khr.value = 0; usd.value = n }

watch([khr, usd, changeIn], () => {
  emit('update:modelValue', {
    received_khr: Number(khr.value) || 0,
    received_usd: Number(usd.value) || 0,
    change_in: changeIn.value,
    valid: short.value === 0 && totalKhr.value > 0,
  })
}, { immediate: true })
</script>
