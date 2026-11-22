<template>
  <!-- B4.9 (Sam): who came to the library, when, and for how long -->
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Header + stats -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm space-y-5">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('visits.page.title') }}</h1>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ t('visits.page.subtitle') }} · <b>{{ rangeText }}</b></p>
        </div>
        <div class="flex gap-2">
          <button type="button" @click="load(meta.current_page)" :disabled="loading"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50">
            <ArrowPathIcon class="w-4 h-4" :class="loading ? 'animate-spin' : ''" /> {{ t('visits.logs.refresh') }}
          </button>
          <button type="button" @click="manualOpen = true"
            class="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer">
            + {{ t('visits.page.manualIn') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button v-for="s in statCards" :key="s.key" type="button" @click="s.action && s.action()"
          class="text-left rounded-2xl p-4 sm:p-5 text-white shadow-md bg-gradient-to-br transition hover:shadow-lg hover:scale-[1.01]"
          :class="[s.cls, s.action ? 'cursor-pointer' : 'cursor-default']">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <component :is="s.icon" class="w-5 h-5" />
            </div>
          </div>
          <p class="text-3xl font-black tabular-nums leading-none">{{ s.value }}</p>
          <p class="text-[11px] font-bold opacity-90 mt-1.5">{{ s.label }}</p>
          <p v-if="s.sub" class="text-[11px] opacity-75 mt-0.5">{{ s.sub }}</p>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-5 shadow-sm space-y-3">
      <div class="flex flex-wrap gap-2">
        <button v-for="r in ranges" :key="r.key" type="button" @click="setRange(r)"
          class="px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer"
          :class="rangeKey === r.key ? 'bg-slate-800 border-slate-800 text-white dark:bg-white dark:text-slate-900' : 'border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-slate-400'">
          {{ r.label }}
        </button>
        <span class="w-px bg-slate-200 dark:bg-white/10 mx-1"></span>
        <button v-for="c in quick" :key="c.key" type="button" @click="toggleQuick(c)"
          class="px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer"
          :class="c.isOn() ? c.on : 'border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-slate-400'">
          {{ c.label }}
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-[auto_auto_1fr_2fr] gap-2 sm:gap-3">
        <input v-model="filters.from" @change="load(1)" type="date" :class="inputCls" :title="t('visits.page.from')" />
        <input v-model="filters.to" @change="load(1)" type="date" :class="inputCls" :title="t('visits.page.to')" />
        <select v-model="filters.type" @change="load(1)" :class="inputCls">
          <option value="">{{ t('visits.page.type') }}: {{ t('visits.page.all') }}</option>
          <option v-for="k in types" :key="k" :value="k">{{ t('visits.type.' + k) }}</option>
        </select>
        <div class="relative col-span-2 md:col-span-1">
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model.trim="filters.search" @input="debouncedLoad" type="search" :placeholder="t('visits.page.search')" :class="[inputCls, 'pl-9 w-full']" />
        </div>
      </div>
    </div>

    <!-- By hour -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-black text-slate-900 dark:text-white">{{ t('visits.page.byHour') }}</h2>
        <span v-if="peakHour != null" class="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full">{{ t('visits.page.peak', { h: peakHour }) }}</span>
      </div>
      <div class="flex items-end gap-1.5 h-44">
        <div v-for="h in hours" :key="h" class="group flex-1 flex flex-col items-center gap-1 h-full justify-end">
          <span class="text-[11px] font-bold tabular-nums" :class="hourCount(h) ? 'text-slate-700 dark:text-slate-200' : 'text-transparent'">{{ hourCount(h) }}</span>
          <div class="w-full rounded-t-lg transition-all"
            :class="h === peakHour ? 'bg-emerald-600' : 'bg-emerald-400/70 group-hover:bg-emerald-500'"
            :style="{ height: barHeight(h) }"></div>
          <span class="text-[11px] text-slate-400 tabular-nums">{{ h }}</span>
        </div>
      </div>
    </div>

    <!-- List -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-900/50 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th class="px-4 sm:px-5 py-3">{{ t('visits.col.person') }}</th>
              <th class="px-4 py-3">{{ t('visits.col.type') }}</th>
              <th class="px-4 py-3">{{ t('visits.col.in') }}</th>
              <th class="px-4 py-3">{{ t('visits.col.out') }}</th>
              <th class="px-4 py-3">{{ t('visits.col.minutes') }}</th>
              <th class="px-4 py-3">{{ t('visits.col.how') }}</th>
              <th class="px-4 sm:px-5 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5">
            <template v-if="loading && !rows.length">
              <tr v-for="i in 6" :key="'s' + i">
                <td colspan="7" class="px-5 py-4"><div class="h-4 rounded bg-slate-100 dark:bg-white/5 animate-pulse"></div></td>
              </tr>
            </template>
            <tr v-else-if="error">
              <td colspan="7" class="px-5 py-10 text-center">
                <p class="text-rose-600 font-semibold">{{ error }}</p>
                <button type="button" @click="load(meta.current_page)" class="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer">{{ t('visits.logs.retry') }}</button>
              </td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="7" class="px-5 py-12 text-center text-slate-400">{{ t('visits.empty') }}</td>
            </tr>
            <template v-else>
              <tr v-for="v in rows" :key="v.id" class="text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                :class="[v.check_out_method === 'auto' ? 'bg-amber-50/70 dark:bg-amber-500/5' : '', loading ? 'opacity-60' : '']">
                <td class="px-4 sm:px-5 py-3 min-w-[200px] border-l-4" :class="!v.check_out_at ? 'border-emerald-500' : v.check_out_method === 'auto' ? 'border-amber-400' : 'border-transparent'">
                  <div class="flex items-center gap-2.5">
                    <img v-if="v.user?.avatar" :src="coverUrl(v.user.avatar)" alt="" class="w-9 h-9 rounded-full object-cover" />
                    <span v-else class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black" :class="typeCls(v.visitor_type)">{{ (v.user?.name || v.guest_name || '?').trim().charAt(0) }}</span>
                    <div class="min-w-0">
                      <p class="font-bold truncate max-w-[220px]">{{ v.user?.name || v.guest_name }}</p>
                      <p class="text-[11px] text-slate-400 truncate max-w-[220px]">{{ v.member?.membership_no || v.guest_phone || '' }}<span v-if="v.member?.class_name"> · {{ v.member.class_name }}</span></p>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3"><span class="px-2.5 py-1 rounded-full text-[11px] font-bold" :class="typeCls(v.visitor_type)">{{ t('visits.type.' + v.visitor_type) }}</span></td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <p class="font-bold tabular-nums">{{ hm(v.check_in_at) }}</p>
                  <p class="text-[11px] text-slate-400">{{ dmy(v.check_in_at) }}</p>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <template v-if="v.check_out_at">
                    <p class="font-bold tabular-nums">{{ hm(v.check_out_at) }}</p>
                    <p v-if="v.check_out_method === 'auto'" class="text-[11px] font-bold text-amber-600">⚠ {{ t('visits.method.auto') }}</p>
                  </template>
                  <span v-else class="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-xs"><span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>{{ t('visits.inside') }}</span>
                </td>
                <td class="px-4 py-3 tabular-nums font-semibold whitespace-nowrap">{{ duration(v) }}</td>
                <td class="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  <span class="font-semibold text-slate-700 dark:text-slate-300">{{ t('visits.method.' + v.check_in_method) }}</span>
                  <span v-if="v.kiosk_device"> · {{ v.kiosk_device.name }}</span><span v-if="v.door_opened_at"> · 🚪</span>
                </td>
                <td class="px-4 sm:px-5 py-3 text-right">
                  <button v-if="!v.check_out_at" type="button" @click="checkOut(v)" class="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-white/10 text-xs font-bold hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer">{{ t('visits.page.checkOut') }}</button>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <DataPager :page="meta.current_page" :last-page="meta.last_page" :total="meta.total" :per-page="perPage"
        @change="load" @per-page="(n) => { perPage = n; load(1) }" />
    </div>

    <!-- Manual check-in -->
    <div v-if="manualOpen" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="manualOpen = false">
      <div class="w-full max-w-md rounded-3xl bg-white dark:bg-slate-800 p-6 space-y-4 shadow-xl">
        <h3 class="text-lg font-black text-slate-900 dark:text-white">{{ t('visits.page.manualIn') }}</h3>
        <div class="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-900">
          <button v-for="m in ['member', 'guest']" :key="m" type="button" @click="manual.mode = m"
            class="flex-1 py-2 rounded-lg text-sm font-semibold cursor-pointer"
            :class="manual.mode === m ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-700 dark:text-emerald-300' : 'text-slate-500'">
            {{ t('visits.page.mode.' + m) }}
          </button>
        </div>
        <template v-if="manual.mode === 'member'">
          <input v-model.trim="manual.search" @input="searchMembers" :placeholder="t('visits.page.memberSearch')" :class="[inputCls, 'w-full h-11']" />
          <ul class="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            <li v-for="m in memberResults" :key="m.id">
              <button type="button" @click="manual.member = m" class="w-full text-left px-2 py-2 text-sm cursor-pointer rounded-lg"
                :class="manual.member?.id === m.id ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''">
                <span class="font-semibold text-slate-800 dark:text-white">{{ m.user?.name }}</span>
                <span class="text-xs text-slate-400 ml-2">{{ m.membership_no }}</span>
              </button>
            </li>
          </ul>
        </template>
        <template v-else>
          <input v-model.trim="manual.guest_name" :placeholder="t('visits.kiosk.guestName')" :class="[inputCls, 'w-full h-11']" />
          <input v-model.trim="manual.guest_phone" :placeholder="t('visits.kiosk.guestPhone')" :class="[inputCls, 'w-full h-11']" />
        </template>
        <div class="flex gap-2 justify-end">
          <button type="button" @click="manualOpen = false" class="px-4 py-2 rounded-xl border border-slate-300 dark:border-white/10 text-sm cursor-pointer dark:text-white">{{ t('visits.cancel') }}</button>
          <button type="button" @click="submitManual" :disabled="!canSubmitManual" class="px-4 py-2 rounded-xl bg-emerald-700 text-white text-sm font-bold disabled:opacity-50 cursor-pointer">{{ t('visits.page.checkIn') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowPathIcon, MagnifyingGlassIcon, UsersIcon, HomeModernIcon, ClockIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import apiClient from '@/api/axios'
import DataPager from '@/components/common/DataPager.vue'
import { coverUrl } from '@/utils/coverUrl'
import { visitService } from '../services/visitService'

const { t } = useI18n()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const iso = (d) => d.toLocaleDateString('en-CA')
const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return iso(d) }
const todayIso = iso(new Date())

const q = route.query
const filters = ref({
  from: q.from || todayIso,
  to: q.to || todayIso,
  type: q.type || '',
  search: q.search || '',
  inside: q.inside === '1',
  auto: q.auto === '1',
  method: q.method || '',
})
const perPage = ref(Number(q.per_page) || 25)
const types = ['student', 'teacher', 'external', 'staff', 'guest', 'other']
const rows = ref([])
const meta = ref({ current_page: Number(q.page) || 1, last_page: 1, total: 0 })
const stats = ref(null)
const loading = ref(false)
const error = ref('')
const hours = Array.from({ length: 13 }, (_, i) => i + 6) // 06..18
const inputCls = 'h-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm outline-none focus:border-emerald-600'

const hm = (v) => new Date(v).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
const dmy = (v) => new Date(v).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })
function duration(v) {
  const m = Number(v.minutes ?? Math.round((Date.now() - new Date(v.check_in_at)) / 60000))
  if (!m && m !== 0) return '—'
  return m >= 60 ? t('visits.page.hm', { h: Math.floor(m / 60), m: m % 60 }) : t('visits.page.m', { m })
}
const typeCls = (k) => ({
  student: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  teacher: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  external: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  staff: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  guest: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
}[k] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300')

// ---- quick views ----
const ranges = computed(() => [
  { key: 'today', from: todayIso, to: todayIso, label: t('visits.range.today') },
  { key: 'yesterday', from: daysAgo(1), to: daysAgo(1), label: t('visits.range.yesterday') },
  { key: '7', from: daysAgo(6), to: todayIso, label: t('visits.range.d7') },
  { key: '30', from: daysAgo(29), to: todayIso, label: t('visits.range.d30') },
])
const rangeKey = computed(() => ranges.value.find((r) => r.from === filters.value.from && r.to === filters.value.to)?.key || 'custom')
const rangeText = computed(() => ranges.value.find((r) => r.key === rangeKey.value)?.label || `${filters.value.from} → ${filters.value.to}`)
function setRange(r) {
  filters.value.from = r.from
  filters.value.to = r.to
  load(1)
}

const quick = computed(() => [
  { key: 'inside', label: '🟢 ' + t('visits.page.insideOnly'), isOn: () => filters.value.inside, toggle: () => (filters.value.inside = !filters.value.inside), on: 'bg-emerald-700 border-emerald-700 text-white' },
  { key: 'auto', label: '⚠ ' + t('visits.page.forgotOut'), isOn: () => filters.value.auto, toggle: () => (filters.value.auto = !filters.value.auto), on: 'bg-amber-500 border-amber-500 text-white' },
  { key: 'external', label: t('visits.type.external'), isOn: () => filters.value.type === 'external', toggle: () => (filters.value.type = filters.value.type === 'external' ? '' : 'external'), on: 'bg-purple-600 border-purple-600 text-white' },
  { key: 'guest', label: t('visits.type.guest'), isOn: () => filters.value.type === 'guest', toggle: () => (filters.value.type = filters.value.type === 'guest' ? '' : 'guest'), on: 'bg-amber-600 border-amber-600 text-white' },
  { key: 'school', label: t('visits.method.school_card'), isOn: () => filters.value.method === 'school_card', toggle: () => (filters.value.method = filters.value.method === 'school_card' ? '' : 'school_card'), on: 'bg-blue-600 border-blue-600 text-white' },
])
function toggleQuick(c) {
  c.toggle()
  load(1)
}

const statCards = computed(() => {
  const s = stats.value || {}
  const o = s.occupancy || {}
  return [
    { key: 'total', icon: UsersIcon, cls: 'from-blue-600 to-blue-700', value: s.total ?? '—', label: t('visits.stat.total'), sub: t('visits.stat.unique', { n: s.unique ?? 0 }) },
    { key: 'inside', icon: HomeModernIcon, cls: 'from-emerald-600 to-emerald-700', value: o.inside ?? '—', label: t('visits.stat.inside'), sub: o.capacity ? t('visits.stat.free', { n: o.free ?? 0, cap: o.capacity }) : '',
      action: () => { filters.value.inside = true; filters.value.auto = false; load(1) } },
    { key: 'avg', icon: ClockIcon, cls: 'from-slate-700 to-slate-800', value: s.avg_minutes != null ? s.avg_minutes + "'" : '—', label: t('visits.stat.avg'), sub: t('visits.stat.minutes') },
    { key: 'auto', icon: ExclamationTriangleIcon, cls: 'from-amber-500 to-amber-600', value: s.auto_closed ?? 0, label: t('visits.page.forgotOut'), sub: t('visits.stat.guestsN', { n: s.by_type?.guest ?? 0 }),
      action: () => { filters.value.auto = true; filters.value.inside = false; load(1) } },
  ]
})

const maxHour = computed(() => Math.max(1, ...Object.values(stats.value?.by_hour || {}).map(Number)))
const hourCount = (h) => Number(stats.value?.by_hour?.[h] || 0)
const barHeight = (h) => `${Math.max(2, (hourCount(h) / maxHour.value) * 100)}%`
const peakHour = computed(() => {
  let best = null
  hours.forEach((h) => { if (hourCount(h) && (best == null || hourCount(h) > hourCount(best))) best = h })
  return best
})

function params(page = 1) {
  const p = { from: filters.value.from, to: filters.value.to, page, per_page: perPage.value }
  if (filters.value.type) p.type = filters.value.type
  if (filters.value.search) p.search = filters.value.search
  if (filters.value.inside) p.inside = 1
  if (filters.value.auto) p.auto = 1
  if (filters.value.method) p.method = filters.value.method
  return p
}

let timer = null
function debouncedLoad() {
  clearTimeout(timer)
  timer = setTimeout(() => load(1), 350)
}

let seq = 0
async function load(page = 1) {
  const my = ++seq
  page = typeof page === 'number' ? page : 1
  loading.value = true
  error.value = ''
  const p = params(page)
  router.replace({ query: { ...p, page: page > 1 ? page : undefined, per_page: perPage.value !== 25 ? perPage.value : undefined } }).catch(() => {})
  try {
    const [list, st] = await Promise.all([
      visitService.list(p),
      visitService.stats({ from: filters.value.from, to: filters.value.to }),
    ])
    if (my !== seq) return
    rows.value = list.data.data
    meta.value = { current_page: list.data.current_page, last_page: list.data.last_page, total: list.data.total }
    stats.value = st.data
  } catch (e) {
    if (my !== seq) return
    error.value = e.response?.data?.message || t('visits.error')
  } finally {
    if (my === seq) loading.value = false
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

onMounted(() => load(meta.value.current_page))
</script>
