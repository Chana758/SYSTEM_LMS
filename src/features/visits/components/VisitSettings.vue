<template>
  <!-- Admin: library hours (auto check-out time), seats, kiosk session, kiosk voice -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('visits.settings.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-5">{{ t('visits.settings.subtitle') }}</p>

    <p v-if="loading" class="text-sm text-gray-400">{{ t('visits.loading') }}</p>

    <div v-else-if="loadError" class="flex flex-wrap items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30 px-4 py-3">
      <span class="text-sm text-rose-700 dark:text-rose-300">{{ loadError }}</span>
      <button type="button" @click="load" class="px-3 py-1.5 text-sm font-semibold rounded-lg bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-300 cursor-pointer">{{ t('visits.settings.retry') }}</button>
    </div>

    <form v-else-if="form" @submit.prevent="save" class="grid sm:grid-cols-2 gap-4">
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.open') }}
        <input v-model="form.library_open_time" type="time" required :class="inputClass" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.close') }}
        <input v-model="form.library_close_time" type="time" required :class="inputClass" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.capacity') }}
        <input v-model.number="form.library_capacity" type="number" min="0" max="5000" required :class="inputClass" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.rescan') }}
        <input v-model.number="form.visit_rescan_seconds" type="number" min="0" max="3600" required :class="inputClass" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.kioskDays') }}
        <input v-model.number="form.session_kiosk_days" type="number" min="1" max="365" required :class="inputClass" />
      </label>

      <div class="sm:col-span-2 mt-2 pt-4 border-t border-gray-100 dark:border-white/10">
        <h3 class="text-sm font-bold text-gray-800 dark:text-white mb-3">{{ t('visits.settings.voiceTitle') }}</h3>
        <div class="space-y-3">
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer">
            <input v-model="form.kiosk_voice_enabled" type="checkbox" class="w-4 h-4 accent-green-700" />
            {{ t('visits.settings.voiceEnabled') }}
          </label>
          <label class="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300 cursor-pointer" :class="{ 'opacity-50': !form.kiosk_voice_enabled }">
            <input v-model="form.kiosk_voice_name" type="checkbox" :disabled="!form.kiosk_voice_enabled" class="w-4 h-4 accent-green-700" />
            {{ t('visits.settings.voiceName') }}
          </label>
          <label class="block text-sm text-gray-700 dark:text-slate-300 max-w-sm" :class="{ 'opacity-50': !form.kiosk_voice_enabled }">
            {{ t('visits.settings.voiceVolume', { v: form.kiosk_voice_volume }) }}
            <input v-model.number="form.kiosk_voice_volume" type="range" min="0" max="100" step="5" :disabled="!form.kiosk_voice_enabled" class="mt-1 block w-full accent-green-700" />
          </label>
          <p class="text-xs text-gray-400 dark:text-slate-500">{{ t('visits.settings.voiceHint') }}</p>
        </div>
      </div>

      <div class="sm:col-span-2">
        <button type="submit" :disabled="busy" class="w-full sm:w-auto px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold rounded-xl disabled:opacity-50 cursor-pointer">{{ t('auth.settings.save') }}</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { visitService } from '../services/visitService'

const { t } = useI18n()
const toast = useToast()
const form = ref(null)
const busy = ref(false)
const loading = ref(false)
const loadError = ref('')

const inputClass = 'mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600'

function errorText(e) {
  const status = e.response?.status
  const msg = e.response?.data?.message || e.message || t('visits.error')
  return status ? `${msg} (HTTP ${status})` : msg
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    form.value = (await visitService.settings()).data
  } catch (e) {
    loadError.value = errorText(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  busy.value = true
  try {
    form.value = (await visitService.saveSettings(form.value)).data
    toast.success(t('visits.devices.savedOk'))
  } catch (e) {
    toast.error(errorText(e))
  } finally {
    busy.value = false
  }
}

onMounted(load)
</script>
