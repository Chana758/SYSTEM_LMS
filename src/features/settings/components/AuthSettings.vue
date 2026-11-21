<template>
  <!-- B3.1 (Sam): Login & registration switches, stored in the settings table (group auth_settings) -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('auth.settings.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-6">{{ t('auth.settings.subtitle') }}</p>

    <p v-if="loaded && !rows.length" class="text-sm text-amber-700 dark:text-amber-300">{{ t('auth.settings.missing') }}</p>

    <form v-else @submit.prevent="save" class="space-y-4">
      <div v-for="row in rows" :key="row.id" class="flex items-center justify-between gap-4 py-2 border-b border-gray-100 dark:border-white/5">
        <span class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t(`auth.settings.${row.key}`, row.description || row.key) }}</span>
        <ToggleSwitch v-if="row.type === 'boolean'" v-model="values[row.key]" />
        <input v-else v-model.number="values[row.key]" type="number" min="0" max="365"
          class="w-24 h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-base sm:text-sm text-right outline-none focus:border-green-600" />
      </div>

      <button type="submit" :disabled="busy || !rows.length"
        class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50 cursor-pointer">
        {{ t('auth.settings.save') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import apiClient from '@/api/axios'
import ToggleSwitch from './ToggleSwitch.vue'

const ORDER = [
  'registration_enabled', 'registration_requires_approval', 'activation_enabled',
  'session_member_days', 'session_staff_hours', 'idle_lock_minutes',
]

const { t } = useI18n()
const toast = useToast()
const rows = ref([])
const values = reactive({})
const loaded = ref(false)
const busy = ref(false)

function toValue(row) {
  if (row.type === 'boolean') return row.value === 'true' || row.value === '1'
  return Number(row.value) || 0
}

async function load() {
  const { data } = await apiClient.get('/settings', { params: { group: 'auth_settings' } })
  rows.value = (data || []).sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key))
  rows.value.forEach((row) => { values[row.key] = toValue(row) })
  loaded.value = true
}

async function save() {
  busy.value = true
  try {
    const changed = rows.value.filter((row) => toValue(row) !== values[row.key])
    for (const row of changed) {
      const value = row.type === 'boolean' ? (values[row.key] ? 'true' : 'false') : String(values[row.key])
      await apiClient.put(`/settings/${row.id}`, { value })
      row.value = value
    }
    toast.success(t('auth.settings.saved'))
  } catch (e) {
    toast.error(e.response?.data?.message || 'Error')
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
