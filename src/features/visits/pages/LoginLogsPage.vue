<template>
  <!-- Admin: every login, failed login, logout and refused card. Built to find problems fast. -->
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Header + stats -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm space-y-5">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('visits.logs.title') }}</h1>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ t('visits.logs.subtitle') }}</p>
        </div>
        <button type="button" @click="refreshAll" :disabled="loading"
          class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer disabled:opacity-50">
          <ArrowPathIcon class="w-4 h-4" :class="loading ? 'animate-spin' : ''" /> {{ t('visits.logs.refresh') }}
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <button v-for="s in statTiles" :key="s.key" type="button" @click="applyPreset(s.preset)"
          class="text-left rounded-2xl p-4 sm:p-5 text-white shadow-md transition hover:shadow-lg hover:scale-[1.01] cursor-pointer bg-gradient-to-br"
          :class="s.cls">
          <div class="flex items-center justify-between mb-3">
            <div class="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
              <component :is="s.icon" class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-black uppercase tracking-widest bg-black/15 px-2.5 py-1 rounded-full">{{ t('visits.logs.last24') }}</span>
          </div>
          <p class="text-3xl font-black tabular-nums leading-none">{{ s.value ?? '—' }}</p>
          <p class="text-[11px] font-bold opacity-90 mt-1.5">{{ s.label }} · <span class="underline">{{ t('visits.logs.show') }}</span></p>
        </button>
      </div>

      <!-- Many failures from one address: click to see them -->
      <div v-if="summary.suspicious_ips?.length" class="rounded-2xl border border-rose-300 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 p-4 text-sm text-rose-800 dark:text-rose-200">
        <p class="font-black mb-2 flex items-center gap-2"><ShieldExclamationIcon class="w-5 h-5" /> {{ t('visits.logs.suspicious') }}</p>
        <div class="flex flex-wrap gap-2">
          <button v-for="s in summary.suspicious_ips" :key="s.ip" type="button" @click="searchFor(s.ip, true)"
            class="px-3 py-1.5 rounded-lg bg-white dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 font-bold tabular-nums cursor-pointer hover:underline">
            {{ s.ip }} · {{ t('visits.logs.failures', { n: s.failures }) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-5 shadow-sm space-y-3">
      <div class="flex flex-wrap gap-2">
        <button v-for="c in quick" :key="c.key" type="button" @click="applyPreset(c.preset)"
          class="px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer"
          :class="isPreset(c.preset) ? c.on : 'border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-slate-400'">
          {{ c.label }}
        </button>
        <span class="w-px bg-slate-200 dark:bg-white/10 mx-1"></span>
        <button v-for="r in ranges" :key="r.key" type="button" @click="setRange(r.days)"
          class="px-3 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer"
          :class="rangeKey === r.key ? 'bg-slate-800 border-slate-800 text-white dark:bg-white dark:text-slate-900' : 'border-slate-300 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-slate-400'">
          {{ r.label }}
        </button>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-[1fr_1fr_auto_auto_2fr] gap-2 sm:gap-3">
        <select v-model="filters.event" @change="load(1)" :class="inputCls">
          <option value="">{{ t('visits.logs.event') }}: {{ t('visits.page.all') }}</option>
          <option v-for="e in events" :key="e" :value="e">{{ t('visits.event.' + e) }}</option>
        </select>
        <select v-model="filters.success" @change="load(1)" :class="inputCls">
          <option value="">{{ t('visits.logs.result') }}: {{ t('visits.page.all') }}</option>
          <option value="1">{{ t('visits.logs.ok') }}</option>
          <option value="0">{{ t('visits.logs.fail') }}</option>
        </select>
        <input v-model="filters.from" @change="onDate" type="date" :class="inputCls" :title="t('visits.page.from')" />
        <input v-model="filters.to" @change="onDate" type="date" :class="inputCls" :title="t('visits.page.to')" />
        <div class="relative col-span-2 md:col-span-1">
          <MagnifyingGlassIcon class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input v-model.trim="filters.search" @input="debouncedLoad" type="search" :placeholder="t('visits.logs.search')" :class="[inputCls, 'pl-9 w-full']" />
        </div>
      </div>

      <div v-if="activeCount" class="flex items-center justify-between text-xs">
        <span class="text-slate-500 dark:text-slate-400">{{ t('visits.logs.filtered', { n: meta.total }) }}</span>
        <button type="button" @click="clearAll" class="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer">{{ t('visits.logs.clear') }}</button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 dark:bg-slate-900/50 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th class="px-4 sm:px-5 py-3">{{ t('visits.logs.time') }}</th>
              <th class="px-4 py-3">{{ t('visits.logs.who') }}</th>
              <th class="px-4 py-3">{{ t('visits.logs.event') }}</th>
              <th class="px-4 py-3">{{ t('visits.logs.result') }}</th>
              <th class="px-4 py-3">IP</th>
              <th class="px-4 sm:px-5 py-3">{{ t('visits.logs.device') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/5">
            <template v-if="loading && !rows.length">
              <tr v-for="i in 6" :key="'s' + i">
                <td colspan="6" class="px-5 py-4"><div class="h-4 rounded bg-slate-100 dark:bg-white/5 animate-pulse"></div></td>
              </tr>
            </template>
            <tr v-else-if="error">
              <td colspan="6" class="px-5 py-10 text-center">
                <p class="text-rose-600 font-semibold">{{ error }}</p>
                <button type="button" @click="load(meta.current_page)" class="mt-3 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer">{{ t('visits.logs.retry') }}</button>
              </td>
            </tr>
            <tr v-else-if="!rows.length">
              <td colspan="6" class="px-5 py-12 text-center text-slate-400">{{ t('visits.empty') }}</td>
            </tr>
            <template v-else>
            <tr v-for="r in rows" :key="r.id"
              class="text-slate-700 dark:text-slate-200 transition-colors"
              :class="[r.success ? 'hover:bg-slate-50 dark:hover:bg-white/5' : 'bg-rose-50/70 dark:bg-rose-500/5 hover:bg-rose-50', loading ? 'opacity-60' : '']">
              <td class="px-4 sm:px-5 py-3 whitespace-nowrap border-l-4" :class="r.success ? 'border-transparent' : 'border-rose-500'">
                <p class="font-bold tabular-nums">{{ time(r.created_at) }}</p>
                <p class="text-[11px] text-slate-400 tabular-nums">{{ day(r.created_at) }}</p>
              </td>
              <td class="px-4 py-3 min-w-[200px]">
                <div class="flex items-center gap-2.5">
                  <span class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0" :class="roleCls(r.user?.role?.name)">{{ initial(r) }}</span>
                  <div class="min-w-0">
                    <button type="button" @click="searchFor(r.user?.email || r.identifier)" class="font-semibold truncate max-w-[240px] block text-left hover:underline cursor-pointer">{{ r.user?.name || r.identifier || '—' }}</button>
                    <p class="text-[11px] text-slate-400 truncate max-w-[240px]">{{ r.user?.role?.name || t('visits.logs.unknownUser') }}<span v-if="r.user && r.identifier"> · {{ r.identifier }}</span></p>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="px-2.5 py-1 rounded-full text-[11px] font-bold" :class="eventCls(r.event)">{{ eventLabel(r.event) }}</span>
              </td>
              <td class="px-4 py-3">
                <span v-if="r.success" class="inline-flex items-center gap-1 text-emerald-600 font-bold text-xs"><CheckCircleIcon class="w-4 h-4" />{{ t('visits.logs.ok') }}</span>
                <div v-else>
                  <span class="inline-flex items-center gap-1 text-rose-600 font-bold text-xs"><XCircleIcon class="w-4 h-4" />{{ t('visits.logs.fail') }}</span>
                  <p v-if="r.reason" class="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-0.5">{{ reasonLabel(r.reason) }}</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <button type="button" @click="searchFor(r.ip)" class="tabular-nums text-xs font-semibold hover:underline cursor-pointer">{{ r.ip || '—' }}</button>
              </td>
              <td class="px-4 sm:px-5 py-3 text-xs text-slate-500 max-w-[240px] truncate" :title="r.user_agent">{{ r.device || shortAgent(r.user_agent) }}</td>
            </tr>
            </template>
          </tbody>
        </table>
      </div>

      <DataPager :page="meta.current_page" :last-page="meta.last_page" :total="meta.total" :per-page="perPage"
        @change="load" @per-page="(n) => { perPage = n; load(1) }" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowPathIcon, CheckCircleIcon, XCircleIcon, ShieldExclamationIcon, MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon, ExclamationTriangleIcon, CreditCardIcon,
} from '@heroicons/vue/24/outline'
import DataPager from '@/components/common/DataPager.vue'
import { visitService } from '../services/visitService'
import { shortAgent } from '../utils/userAgent'

const { t, te } = useI18n()
const route = useRoute()
const router = useRouter()

const events = ['login', 'login_failed', 'login_blocked', 'activate', 'logout', 'logout_all', 'card_denied', 'self_checkout_start', 'self_checkout_pin_locked', 'staff_activate', 'staff_reset']
const inputCls = 'h-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm outline-none focus:border-emerald-600'

const blank = () => ({ event: '', success: '', from: '', to: '', search: '' })
// Filters live in the address bar, so a "problem view" can be bookmarked or sent to a colleague
const filters = ref({ ...blank(), ...pick(route.query) })
const perPage = ref(Number(route.query.per_page) || 25)
const rows = ref([])
const meta = ref({ current_page: Number(route.query.page) || 1, last_page: 1, total: 0 })
const summary = ref({})
const loading = ref(false)
const error = ref('')

function pick(q) {
  const out = {}
  Object.keys(blank()).forEach((k) => { if (q[k] != null) out[k] = String(q[k]) })
  return out
}

const time = (iso) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const day = (iso) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })
const initial = (r) => (r.user?.name || r.identifier || '?').trim().charAt(0).toUpperCase()
const roleCls = (role) => ({
  admin: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  librarian: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  member: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  kiosk: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
}[role] || 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300')
const eventCls = (e) => ({
  login: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  logout: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  logout_all: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  activate: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  staff_activate: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  staff_reset: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300',
  login_failed: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  login_blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  card_denied: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  self_checkout_pin_locked: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
}[e] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300')
const eventLabel = (e) => (te('visits.event.' + e) ? t('visits.event.' + e) : e)
const reasonLabel = (c) => (te('visits.reason.' + c) ? t('visits.reason.' + c) : c)

// ---- quick views ----
const PROBLEMS = { success: '0' }
const BAD_LOGINS = { event: 'login_failed,login_blocked' }
const CARDS = { event: 'card_denied' }
const quick = computed(() => [
  { key: 'all', label: t('visits.logs.qAll'), preset: {}, on: 'bg-emerald-700 border-emerald-700 text-white' },
  { key: 'problems', label: '⚠ ' + t('visits.logs.qProblems'), preset: PROBLEMS, on: 'bg-rose-600 border-rose-600 text-white' },
  { key: 'bad', label: t('visits.logs.qBadLogins'), preset: BAD_LOGINS, on: 'bg-rose-600 border-rose-600 text-white' },
  { key: 'cards', label: t('visits.logs.qCards'), preset: CARDS, on: 'bg-amber-500 border-amber-500 text-white' },
  { key: 'logins', label: t('visits.logs.qLogins'), preset: { event: 'login', success: '1' }, on: 'bg-emerald-700 border-emerald-700 text-white' },
  { key: 'staff', label: '🛡 ' + t('visits.logs.qStaff'), preset: { event: 'staff_activate,staff_reset,activate' }, on: 'bg-indigo-600 border-indigo-600 text-white' },
])
function isPreset(p) {
  return filters.value.event === (p.event || '') && filters.value.success === (p.success || '')
}
function applyPreset(p) {
  filters.value.event = p.event || ''
  filters.value.success = p.success || ''
  load(1)
}

const statTiles = computed(() => [
  { key: 'ok', value: summary.value.logins, label: t('visits.logs.logins24'), icon: ArrowRightOnRectangleIcon, preset: { event: 'login', success: '1' }, cls: 'from-emerald-600 to-emerald-700' },
  { key: 'fail', value: summary.value.failed, label: t('visits.logs.failed24'), icon: ExclamationTriangleIcon, preset: BAD_LOGINS, cls: 'from-rose-600 to-rose-700' },
  { key: 'card', value: summary.value.card_denied, label: t('visits.logs.cards24'), icon: CreditCardIcon, preset: CARDS, cls: 'from-amber-500 to-amber-600' },
])

// ---- date range ----
const iso = (d) => d.toLocaleDateString('en-CA')
const ranges = computed(() => [
  { key: 'today', days: 0, label: t('visits.range.today') },
  { key: '7', days: 6, label: t('visits.range.d7') },
  { key: '30', days: 29, label: t('visits.range.d30') },
  { key: 'any', days: null, label: t('visits.range.any') },
])
const rangeKey = computed(() => {
  const { from, to } = filters.value
  if (!from && !to) return 'any'
  const today = iso(new Date())
  if (to !== today) return 'custom'
  for (const r of ranges.value) {
    if (r.days == null) continue
    const d = new Date(); d.setDate(d.getDate() - r.days)
    if (from === iso(d)) return r.key
  }
  return 'custom'
})
function setRange(days) {
  if (days == null) { filters.value.from = ''; filters.value.to = '' } else {
    const d = new Date(); d.setDate(d.getDate() - days)
    filters.value.from = iso(d); filters.value.to = iso(new Date())
  }
  load(1)
}
function onDate() { load(1) }

const activeCount = computed(() => Object.values(filters.value).filter((v) => v !== '').length)
function clearAll() { filters.value = blank(); load(1) }
function searchFor(v, problemsOnly = false) {
  if (!v) return
  filters.value.search = String(v)
  if (problemsOnly) filters.value.success = '0'
  load(1)
}

let timer = null
function debouncedLoad() {
  clearTimeout(timer)
  timer = setTimeout(() => load(1), 350)
}

let seq = 0
async function load(page = 1) {
  const my = ++seq
  loading.value = true
  error.value = ''
  const params = { page, per_page: perPage.value }
  Object.entries(filters.value).forEach(([k, v]) => { if (v !== '') params[k] = v })
  router.replace({ query: { ...params, per_page: perPage.value !== 25 ? perPage.value : undefined, page: page > 1 ? page : undefined } }).catch(() => {})
  try {
    const { data } = await visitService.loginLogs(params)
    if (my !== seq) return // an older request finished late
    rows.value = data.data
    meta.value = { current_page: data.current_page, last_page: data.last_page, total: data.total }
  } catch (e) {
    if (my !== seq) return
    error.value = e.response?.data?.message || t('visits.error')
  } finally {
    if (my === seq) loading.value = false
  }
}

function loadSummary() {
  visitService.loginSummary().then(({ data }) => (summary.value = data)).catch(() => {})
}
function refreshAll() {
  loadSummary()
  load(meta.value.current_page)
}

onMounted(() => {
  load(meta.value.current_page)
  loadSummary()
})
</script>
