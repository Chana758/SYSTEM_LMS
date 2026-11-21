<template>
  <!-- Admin: every login, failed login, logout and refused card -->
  <div class="p-4 sm:p-6 space-y-5">
    <div>
      <h1 class="text-2xl font-black text-gray-800 dark:text-white">{{ t('visits.logs.title') }}</h1>
      <p class="text-sm text-gray-500 dark:text-slate-400">{{ t('visits.logs.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 p-4">
        <p class="text-xs text-gray-500">{{ t('visits.logs.logins24') }}</p>
        <p class="text-3xl font-black text-emerald-600 tabular-nums">{{ summary.logins ?? '—' }}</p>
      </div>
      <div class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 p-4">
        <p class="text-xs text-gray-500">{{ t('visits.logs.failed24') }}</p>
        <p class="text-3xl font-black text-rose-600 tabular-nums">{{ summary.failed ?? '—' }}</p>
      </div>
      <div class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 p-4">
        <p class="text-xs text-gray-500">{{ t('visits.logs.cards24') }}</p>
        <p class="text-3xl font-black text-amber-600 tabular-nums">{{ summary.card_denied ?? '—' }}</p>
      </div>
    </div>

    <div v-if="summary.suspicious_ips?.length" class="rounded-2xl border border-rose-200 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-800 p-4 text-sm text-rose-800 dark:text-rose-200">
      <p class="font-bold mb-1">{{ t('visits.logs.suspicious') }}</p>
      <p v-for="s in summary.suspicious_ips" :key="s.ip" class="tabular-nums">{{ s.ip }} — {{ t('visits.logs.failures', { n: s.failures }) }}</p>
    </div>

    <div class="flex flex-wrap gap-3 items-end bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 rounded-2xl p-4">
      <label class="text-xs font-semibold text-gray-500">{{ t('visits.logs.event') }}
        <select v-model="filters.event" class="mt-1 block h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm">
          <option value="">{{ t('visits.page.all') }}</option>
          <option v-for="e in events" :key="e" :value="e">{{ t('visits.event.' + e) }}</option>
        </select>
      </label>
      <label class="text-xs font-semibold text-gray-500">{{ t('visits.logs.result') }}
        <select v-model="filters.success" class="mt-1 block h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm">
          <option value="">{{ t('visits.page.all') }}</option>
          <option value="1">{{ t('visits.logs.ok') }}</option>
          <option value="0">{{ t('visits.logs.fail') }}</option>
        </select>
      </label>
      <label class="text-xs font-semibold text-gray-500">{{ t('visits.page.from') }}
        <input v-model="filters.from" type="date" class="mt-1 block h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
      </label>
      <label class="text-xs font-semibold text-gray-500">{{ t('visits.page.to') }}
        <input v-model="filters.to" type="date" class="mt-1 block h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
      </label>
      <label class="text-xs font-semibold text-gray-500 flex-1 min-w-[180px]">{{ t('visits.logs.search') }}
        <input v-model.trim="filters.search" @keyup.enter="load()" type="search" class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 dark:text-white px-3 text-sm" />
      </label>
      <button type="button" @click="load()" class="h-10 px-4 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-sm font-semibold cursor-pointer">{{ t('visits.page.apply') }}</button>
    </div>

    <div class="rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-white/10 overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="text-left text-xs text-gray-500 dark:text-slate-400 border-b border-gray-100 dark:border-white/5">
          <tr>
            <th class="px-4 py-3">{{ t('visits.logs.time') }}</th>
            <th class="px-4 py-3">{{ t('visits.logs.who') }}</th>
            <th class="px-4 py-3">{{ t('visits.logs.event') }}</th>
            <th class="px-4 py-3">{{ t('visits.logs.result') }}</th>
            <th class="px-4 py-3">IP</th>
            <th class="px-4 py-3">{{ t('visits.logs.device') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-white/5">
          <tr v-if="!rows.length"><td colspan="6" class="px-4 py-8 text-center text-gray-400">{{ t('visits.empty') }}</td></tr>
          <tr v-for="r in rows" :key="r.id" class="text-gray-700 dark:text-slate-200">
            <td class="px-4 py-3 tabular-nums whitespace-nowrap">{{ dt(r.created_at) }}</td>
            <td class="px-4 py-3">
              <p class="font-semibold">{{ r.user?.name || r.identifier || '—' }}</p>
              <p class="text-xs text-gray-400">{{ r.user?.role?.name }}<span v-if="r.user && r.identifier"> · {{ r.identifier }}</span></p>
            </td>
            <td class="px-4 py-3">{{ t('visits.event.' + r.event) }}</td>
            <td class="px-4 py-3">
              <span v-if="r.success" class="text-emerald-600 font-semibold">{{ t('visits.logs.ok') }}</span>
              <span v-else class="text-rose-600 font-semibold">{{ t('visits.logs.fail') }}<span v-if="r.reason" class="font-normal text-xs"> · {{ r.reason }}</span></span>
            </td>
            <td class="px-4 py-3 tabular-nums text-xs">{{ r.ip }}</td>
            <td class="px-4 py-3 text-xs text-gray-500 max-w-[260px] truncate" :title="r.user_agent">{{ r.device || shortAgent(r.user_agent) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="meta.last_page > 1" class="flex items-center justify-between px-4 py-3 text-sm text-gray-500">
        <button type="button" :disabled="meta.current_page <= 1" @click="load(meta.current_page - 1)" class="px-3 py-1.5 rounded-lg border disabled:opacity-40 cursor-pointer">‹</button>
        <span>{{ meta.current_page }} / {{ meta.last_page }}</span>
        <button type="button" :disabled="meta.current_page >= meta.last_page" @click="load(meta.current_page + 1)" class="px-3 py-1.5 rounded-lg border disabled:opacity-40 cursor-pointer">›</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { visitService } from '../services/visitService'
import { shortAgent } from '../utils/userAgent'

const { t } = useI18n()
const events = ['login', 'login_failed', 'login_blocked', 'activate', 'logout', 'logout_all', 'card_denied']
const filters = ref({ event: '', success: '', from: '', to: '', search: '' })
const rows = ref([])
const meta = ref({ current_page: 1, last_page: 1 })
const summary = ref({})

const dt = (iso) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })

async function load(page = 1) {
  const params = { page }
  Object.entries(filters.value).forEach(([k, v]) => { if (v !== '') params[k] = v })
  const { data } = await visitService.loginLogs(params)
  rows.value = data.data
  meta.value = { current_page: data.current_page, last_page: data.last_page }
}

onMounted(() => {
  load()
  visitService.loginSummary().then(({ data }) => (summary.value = data)).catch(() => {})
})
</script>
