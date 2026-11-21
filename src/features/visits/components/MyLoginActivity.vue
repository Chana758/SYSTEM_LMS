<template>
  <!-- My recent logins: a login I don't recognise means "change password + log out everywhere" -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('visits.mine.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-4">{{ t('visits.mine.subtitle') }}</p>
    <p v-if="!rows.length" class="text-sm text-gray-400">{{ t('visits.empty') }}</p>
    <ul v-else class="divide-y divide-gray-100 dark:divide-white/5">
      <li v-for="r in rows" :key="r.id" class="py-2.5 flex items-center justify-between gap-3 text-sm">
        <div class="min-w-0">
          <p class="font-medium" :class="r.success ? 'text-gray-700 dark:text-slate-200' : 'text-rose-600'">{{ t('visits.event.' + r.event) }}</p>
          <p class="text-xs text-gray-400 truncate">{{ shortAgent(r.user_agent) }} · {{ r.ip }}</p>
        </div>
        <span class="text-xs text-gray-500 tabular-nums whitespace-nowrap">{{ dt(r.created_at) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { visitService } from '../services/visitService'
import { shortAgent } from '../utils/userAgent'

const { t } = useI18n()
const rows = ref([])
const dt = (iso) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

onMounted(() => {
  visitService.myLoginLogs().then(({ data }) => (rows.value = data)).catch(() => {})
})
</script>
