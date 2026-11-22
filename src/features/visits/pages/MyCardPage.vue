<template>
  <!-- B4.2 / B9.2 (Sam): digital library card. The QR changes every minute so a screenshot stops working. -->
  <div class="max-w-md mx-auto p-4 sm:p-6 space-y-5">
    <div class="rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-6 shadow-lg">
      <div class="flex items-center gap-4">
        <img v-if="card?.avatar" :src="card.avatar" alt="" class="w-14 h-14 rounded-2xl object-cover bg-white/20" />
        <div v-else class="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-xl font-black">{{ initials }}</div>
        <div class="min-w-0">
          <p class="text-xs uppercase tracking-widest text-emerald-200">{{ t('visits.card.title') }}</p>
          <p class="text-lg font-black truncate">{{ card?.name || '…' }}</p>
          <p v-if="card?.name_en" class="text-sm text-emerald-100 truncate">{{ card.name_en }}</p>
          <p class="text-xs text-emerald-100/80">{{ card?.membership_no }}<span v-if="card?.class_name"> · {{ card.class_name }}</span></p>
        </div>
      </div>

      <div class="mt-6 bg-white rounded-2xl p-5 flex flex-col items-center">
        <QrcodeVue v-if="card?.code" :value="card.code" :size="240" level="M" />
        <div v-else class="w-[240px] h-[240px] flex items-center justify-center text-slate-400 text-sm">{{ error || t('visits.loading') }}</div>
        <div class="w-full mt-4">
          <div class="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div class="h-full bg-emerald-500 transition-all duration-1000" :style="{ width: progress + '%' }"></div>
          </div>
          <p class="text-xs text-slate-500 text-center mt-2">{{ t('visits.card.renews', { s: secondsLeft }) }}</p>
        </div>
      </div>

      <p class="text-sm text-emerald-50/90 mt-4 text-center">{{ t('visits.card.hint') }}</p>
      <p v-if="card?.expiry_date" class="text-xs text-emerald-200/80 mt-1 text-center">{{ t('visits.card.validUntil', { date: card.expiry_date }) }}</p>
    </div>

    <div class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 p-5">
      <h2 class="font-bold text-gray-800 dark:text-white mb-3">{{ t('visits.card.myVisits') }}</h2>
      <p v-if="!visits.length" class="text-sm text-gray-400">{{ t('visits.empty') }}</p>
      <ul v-else class="divide-y divide-gray-100 dark:divide-white/5">
        <li v-for="v in visits" :key="v.id" class="py-2.5 flex items-center justify-between text-sm">
          <span class="text-gray-700 dark:text-slate-200">{{ day(v.check_in_at) }}</span>
          <span class="text-gray-500 dark:text-slate-400 tabular-nums">{{ hm(v.check_in_at) }} – {{ v.check_out_at ? hm(v.check_out_at) : t('visits.inside') }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import QrcodeVue from 'qrcode.vue'
import { visitService } from '../services/visitService'

const { t } = useI18n()
const card = ref(null)
const visits = ref([])
const error = ref('')
const nowSec = ref(Math.floor(Date.now() / 1000))

const secondsLeft = computed(() => Math.max(0, (card.value?.expires_at || 0) - nowSec.value))
const progress = computed(() => (card.value?.lifetime ? (secondsLeft.value / card.value.lifetime) * 100 : 0))
const initials = computed(() => (card.value?.name || '?').trim().slice(0, 1).toUpperCase())
const hm = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })

let loading = false
async function load() {
  if (loading) return
  loading = true
  try {
    card.value = (await visitService.myCardCode()).data
    error.value = ''
  } catch (e) {
    error.value = e.response?.data?.message || t('visits.kiosk.offline')
  } finally {
    loading = false
  }
}

let tick = null
onMounted(async () => {
  await load()
  visitService.myVisits().then(({ data }) => (visits.value = data)).catch(() => {})
  tick = setInterval(() => {
    nowSec.value = Math.floor(Date.now() / 1000)
    // Ask for the next code a few seconds before this one expires
    if (card.value && secondsLeft.value <= 5) load()
  }, 1000)
})
onBeforeUnmount(() => clearInterval(tick))
</script>
