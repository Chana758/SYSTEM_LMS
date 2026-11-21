<template>
  <!-- Admin: library hours (auto check-out time), seats, kiosk session -->
  <div>
    <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('visits.settings.title') }}</h2>
    <p class="text-sm text-gray-400 dark:text-slate-400 mb-5">{{ t('visits.settings.subtitle') }}</p>

    <form v-if="form" @submit.prevent="save" class="grid sm:grid-cols-2 gap-4">
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.open') }}
        <input v-model="form.library_open_time" type="time" required class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.close') }}
        <input v-model="form.library_close_time" type="time" required class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.capacity') }}
        <input v-model.number="form.library_capacity" type="number" min="0" max="5000" required class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.rescan') }}
        <input v-model.number="form.visit_rescan_seconds" type="number" min="0" max="3600" required class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
      </label>
      <label class="text-sm font-medium text-gray-700 dark:text-slate-300">{{ t('visits.settings.kioskDays') }}
        <input v-model.number="form.session_kiosk_days" type="number" min="1" max="365" required class="mt-1 block w-full h-10 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 text-gray-900 dark:text-white px-3 text-sm outline-none focus:border-green-600" />
      </label>
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

async function save() {
  busy.value = true
  try {
    form.value = (await visitService.saveSettings(form.value)).data
    toast.success(t('visits.devices.savedOk'))
  } catch (e) {
    toast.error(e.response?.data?.message || t('visits.error'))
  } finally {
    busy.value = false
  }
}

onMounted(async () => {
  form.value = (await visitService.settings()).data
})
</script>

