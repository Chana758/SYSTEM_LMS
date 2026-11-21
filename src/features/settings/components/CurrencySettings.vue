<template>
  <!-- Currency (Sam): exchange rate for ៛ <-> $ and the default currency people see first -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('fines.currency.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-6">{{ t('fines.currency.subtitle') }}</p>

    <p v-if="loaded && !rateRow" class="text-sm text-amber-700 dark:text-amber-300">{{ t('auth.settings.missing') }}</p>

    <form v-else @submit.prevent="save" class="space-y-4">
      <div class="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-white/5">
        <span class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('fines.currency.rate') }}</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-gray-500">1$ =</span>
          <input v-model.number="rate" type="number" min="1000" max="10000" step="10"
            class="w-28 h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-base sm:text-sm text-right outline-none focus:border-green-600" />
          <span class="text-sm font-bold text-gray-500">៛</span>
        </div>
      </div>

      <div class="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-white/5">
        <span class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('fines.currency.default') }}</span>
        <div class="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
          <button v-for="c in ['KHR', 'USD']" :key="c" type="button" @click="def = c"
            class="px-4 py-1.5 rounded-lg text-xs font-black cursor-pointer"
            :class="def === c ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm' : 'text-slate-500'">
            {{ c === 'KHR' ? '៛ Riel' : '$ Dollar' }}
          </button>
        </div>
      </div>

      <p class="text-xs text-gray-400 dark:text-slate-500">{{ t('fines.currency.example', { usd: '$1.00', khr: (Number(rate) || 0).toLocaleString('en-US') + '៛' }) }}</p>

      <button type="submit" :disabled="busy"
        class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer">
        {{ t('auth.settings.save') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import { useCurrencyStore } from '@/stores/currencyStore'

const { t } = useI18n()
const toast = useToast()
const currencyStore = useCurrencyStore()

const rateRow = ref(null)
const defRow = ref(null)
const rate = ref(4100)
const def = ref('KHR')
const loaded = ref(false)
const busy = ref(false)

async function load() {
  const { data } = await apiClient.get('/settings', { params: { group: 'payment_settings' } })
  rateRow.value = (data || []).find((r) => r.key === 'exchange_rate_khr_per_usd') || null
  defRow.value = (data || []).find((r) => r.key === 'default_currency') || null
  rate.value = Number(rateRow.value?.value) || 4100
  def.value = defRow.value?.value === 'USD' ? 'USD' : 'KHR'
  loaded.value = true
}

async function save() {
  if (!(rate.value >= 1000 && rate.value <= 10000)) {
    toast.error('1,000 – 10,000')
    return
  }
  busy.value = true
  try {
    await apiClient.put(`/settings/${rateRow.value.id}`, { value: String(rate.value) })
    if (defRow.value) await apiClient.put(`/settings/${defRow.value.id}`, { value: def.value })
    await currencyStore.loadConfig()
    toast.success(t('auth.settings.saved'))
  } catch (e) {
    toast.error(e.response?.data?.message || 'Error')
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
