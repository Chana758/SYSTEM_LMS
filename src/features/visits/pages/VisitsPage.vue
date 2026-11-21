<template>
  <!-- B4.9 (Sam): who came to the library, when, and for how long -->
  <div class="p-4 sm:p-6 space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-black text-gray-800 dark:text-white">{{ t('visits.page.title') }}</h1>
        <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('visits.page.subtitle') }}</p>
      </div>
      <button type="button" @click="manualOpen = true"
        class="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-semibold cursor-pointer">
        + {{ t('visits.page.manualIn') }}
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap gap-3 items-end bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
      <label class="text-xs font-semibold text-gray-500">{{ t('visits.page.from') }}
        <input v-model="filters.from" type="date" class="mt-1 block h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
      </label>
      <label class="text-xs font-semibold text-gray-500">{{ t('visits.page.to') }}
        <input v-model="filters.to" type="date" class="mt-1 block h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
      </label>
      <label class="text-xs font-semibold text-gray-500">{{ t('visits.page.type') }}
        <select v-model="filters.type" class="mt-1 block h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm">
          <option value="">{{ t('visits.page.all') }}</option>
          <option v-for="k in types" :key="k" :value="k">{{ t('visits.type.' + k) }}</option>
        </select>
      </label>
      <label class="text-xs font-semibold text-gray-500 flex-1 min-w-[180px]">{{ t('visits.page.search') }}
        <input v-model.trim="filters.search" @keyup.enter="load" type="search" class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
      </label>
      <label class="flex items-center gap-2 h-10 text-sm text-gray-600 dark:text-slate-300">
        <input v-model="filters.inside" type="checkbox" class="w-4 h-4" /> {{ t('visits.page.insideOnly') }}
      </label>
      <button type="button" @click="load" class="h-10 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold cursor-pointer">{{ t('visits.page.apply') }}</button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div v-for="s in statCards" :key="s.label" class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 p-4">
        <p class="text-xs text-gray-500 dark:text-slate-400">{{ s.label }}</p>
        <p class="text-3xl font-black text-gray-800 dark:text-white mt-1 tabular-nums">{{ s.value }}</p>
        <p v-if="s.sub" class="text-xs text-gray-400 mt-1">{{ s.sub }}</p>
      </div>
    </div>

    <!-- By hour -->
    <div class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 p-5">
      <h2 class="font-bold text-gray-800 dark:text-white mb-4">{{ t('visits.page.byHour') }}</h2>
      <div class="flex items-end gap-1.5 h-40">
        <div v-for="h in hours" :key="h" class="flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <span class="text-[11px] text-gray-500 tabular-nums">{{ hourCount(h) || '' }}</span>
          <div class="w-full rounded-t-md bg-emerald-500/80" :style="{ height: barHeight(h) }"></div>
          <span class="text-[11px] text-gray-400 tabular-nums">{{ h }}</span>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-white/5">
          <tr>
            <th class="px-4 py-3">{{ t('visits.col.person') }}</th>
            <th class="px-4 py-3">{{ t('visits.col.type') }}</th>
            <th class="px-4 py-3">{{ t('visits.col.in') }}</th>
            <th class="px-4 py-3">{{ t('visits.col.out') }}</th>
            <th class="px-4 py-3">{{ t('visits.col.minutes') }}</th>
            <th class="px-4 py-3">{{ t('visits.col.how') }}</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
          <tr v-if="!rows.length"><td colspan="7" class="px-4 py-8 text-center text-gray-400">{{ loading ? t('visits.loading') : t('visits.empty') }}</td></tr>
          <tr v-for="v in rows" :key="v.id" class="text-gray-700 dark:text-slate-200">
            <td class="px-4 py-3">
              <p class="font-semibold">{{ v.user?.name || v.guest_name }}</p>
              <p class="text-xs text-gray-400">{{ v.member?.membership_no || v.guest_phone || '' }}<span v-if="v.member?.class_name"> · {{ v.member.class_name }}</span></p>
            </td>
            <td class="px-4 py-3">{{ t('visits.type.' + v.visitor_type) }}</td>
            <td class="px-4 py-3 tabular-nums">{{ dt(v.check_in_at) }}</td>
            <td class="px-4 py-3 tabular-nums">
              <span v-if="v.check_out_at">{{ hm(v.check_out_at) }}<span v-if="v.check_out_method === 'auto'" class="ml-1 text-xs text-amber-600">({{ t('visits.method.auto') }})</span></span>
              <span v-else class="text-emerald-600 font-semibold">{{ t('visits.inside') }}</span>
            </td>
            <td class="px-4 py-3 tabular-nums">{{ v.minutes }}</td>
            <td class="px-4 py-3 text-xs text-gray-500">
              {{ t('visits.method.' + v.check_in_method) }}<span v-if="v.kiosk_device"> · {{ v.kiosk_device.name }}</span><span v-if="v.door_opened_at"> · 🚪</span>
            </td>
            <td class="px-4 py-3 text-right">
              <button v-if="!v.check_out_at" type="button" @click="checkOut(v)" class="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-xs font-semibold cursor-pointer">{{ t('visits.page.checkOut') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="meta.last_page > 1" class="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
        <button type="button" :disabled="meta.current_page <= 1" @click="load(meta.current_page - 1)" class="px-3 py-1.5 rounded-lg border disabled:opacity-40 cursor-pointer">‹</button>
        <span>{{ meta.current_page }} / {{ meta.last_page }}</span>
        <button type="button" :disabled="meta.current_page >= meta.last_page" @click="load(meta.current_page + 1)" class="px-3 py-1.5 rounded-lg border disabled:opacity-40 cursor-pointer">›</button>
      </div>
    </div>

    <!-- Manual check-in -->
    <div v-if="manualOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div class="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 space-y-4">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white">{{ t('visits.page.manualIn') }}</h3>
        <div class="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
          <button v-for="m in ['member', 'guest']" :key="m" type="button" @click="manual.mode = m"
            class="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            :class="manual.mode === m ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-300' : 'text-slate-500'">
            {{ t('visits.page.mode.' + m) }}
          </button>
        </div>
        <template v-if="manual.mode === 'member'">
          <input v-model.trim="manual.search" @input="searchMembers" :placeholder="t('visits.page.memberSearch')"
            class="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
          <ul class="max-h-52 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5">
            <li v-for="m in memberResults" :key="m.id">
              <button type="button" @click="manual.member = m" class="w-full text-left px-2 py-2 text-sm cursor-pointer rounded-lg"
                :class="manual.member?.id === m.id ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''">
                <span class="font-semibold text-gray-800 dark:text-white">{{ m.user?.name }}</span>
                <span class="text-xs text-gray-400 ml-2">{{ m.membership_no }}</span>
              </button>
            </li>
          </ul>
        </template>
        <template v-else>
          <input v-model.trim="manual.guest_name" :placeholder="t('visits.kiosk.guestName')" class="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
          <input v-model.trim="manual.guest_phone" :placeholder="t('visits.kiosk.guestPhone')" class="w-full h-11 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
        </template>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="manualOpen = false" class="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm cursor-pointer dark:text-white">{{ t('visits.cancel') }}</button>
          <button type="button" @click="submitManual" :disabled="!canSubmitManual" class="px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-semibold disabled:opacity-50 cursor-pointer">{{ t('visits.page.checkIn') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import { visitService } from '../services/visitService'

const { t } = useI18n()
const toast = useToast()

const todayIso = new Date().toLocaleDateString('en-CA')
const filters = ref({ from: todayIso, to: todayIso, type: '', search: '', inside: false })
const types = ['student', 'teacher', 'external', 'staff', 'guest', 'other']
const rows = ref([])
const meta = ref({ current_page: 1, last_page: 1 })
const stats = ref(null)
const loading = ref(false)
const hours = Array.from({ length: 13 }, (_, i) => i + 6) // 06..18

const hm = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const dt = (iso) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

const statCards = computed(() => {
  const s = stats.value || {}
  const o = s.occupancy || {}
  return [
    { label: t('visits.stat.total'), value: s.total ?? '—', sub: t('visits.stat.unique', { n: s.unique ?? 0 }) },
    { label: t('visits.stat.inside'), value: o.inside ?? '—', sub: o.capacity ? t('visits.stat.free', { n: o.free ?? 0, cap: o.capacity }) : '' },
    { label: t('visits.stat.avg'), value: s.avg_minutes != null ? s.avg_minutes + "'" : '—', sub: t('visits.stat.minutes') },
    { label: t('visits.stat.guests'), value: s.by_type?.guest ?? 0, sub: t('visits.stat.auto', { n: s.auto_closed ?? 0 }) },
  ]
})

const maxHour = computed(() => Math.max(1, ...Object.values(stats.value?.by_hour || {}).map(Number)))
const hourCount = (h) => Number(stats.value?.by_hour?.[h] || 0)
const barHeight = (h) => `${Math.max(2, (hourCount(h) / maxHour.value) * 100)}%`

function params(page = 1) {
  const p = { from: filters.value.from, to: filters.value.to, page }
  if (filters.value.type) p.type = filters.value.type
  if (filters.value.search) p.search = filters.value.search
  if (filters.value.inside) p.inside = 1
  return p
}

async function load(page = 1) {
  loading.value = true
  try {
    const [list, st] = await Promise.all([
      visitService.list(params(typeof page === 'number' ? page : 1)),
      visitService.stats({ from: filters.value.from, to: filters.value.to }),
    ])
    rows.value = list.data.data
    meta.value = { current_page: list.data.current_page, last_page: list.data.last_page }
    stats.value = st.data
  } catch (e) {
    toast.error(e.response?.data?.message || t('visits.error'))
  } finally {
    loading.value = false
  }
}

async function checkOut(v) {
  try {
    await visitService.checkOut(v.id)
    toast.success(t('visits.page.checkedOut'))
    load(meta.value.current_page)
  } catch (e) {
    toast.error(e.response?.data?.message || t('visits.error'))
  }
}

// Manual check-in
const manualOpen = ref(false)
const manual = ref({ mode: 'member', search: '', member: null, guest_name: '', guest_phone: '' })
const memberResults = ref([])
const canSubmitManual = computed(() => (manual.value.mode === 'member' ? !!manual.value.member : !!manual.value.guest_name))
let searchTimer = null
function searchMembers() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(async () => {
    if (manual.value.search.length < 2) return (memberResults.value = [])
    const { data } = await apiClient.get('/members', { params: { search: manual.value.search, per_page: 8 } })
    memberResults.value = data.data || []
  }, 300)
}
async function submitManual() {
  const payload = manual.value.mode === 'member'
    ? { member_id: manual.value.member.id }
    : { guest_name: manual.value.guest_name, guest_phone: manual.value.guest_phone || null }
  try {
    await visitService.checkIn(payload)
    toast.success(t('visits.page.checkedIn'))
    manualOpen.value = false
    manual.value = { mode: 'member', search: '', member: null, guest_name: '', guest_phone: '' }
    load()
  } catch (e) {
    toast.error(e.response?.data?.message || t('visits.error'))
  }
}

onMounted(load)
</script>
