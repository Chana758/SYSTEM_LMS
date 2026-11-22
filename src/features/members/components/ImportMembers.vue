<template>
  <!-- B2.1 (Sam): import students/teachers from Excel; check first, then import -->
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm space-y-5">
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
      <div>
        <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ t('auth.import.title') }}</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">{{ t('auth.import.subtitle') }}</p>
      </div>
      <button type="button" @click="downloadTemplate"
        class="shrink-0 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer">
        {{ t('auth.import.template') }}
      </button>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
      <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" @change="onFile"
        class="text-sm text-slate-700 dark:text-slate-200 file:mr-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-slate-100 dark:file:bg-slate-700 file:font-bold file:text-xs cursor-pointer" />
      <button type="button" :disabled="!file || busy" @click="check"
        class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 text-white text-xs font-bold disabled:opacity-40 cursor-pointer">
        {{ t('auth.import.check') }}
      </button>
      <button type="button" :disabled="!canImport || busy" @click="run"
        class="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-40 cursor-pointer">
        {{ t('auth.import.run') }}
      </button>
    </div>

    <div v-if="result" class="space-y-3">
      <div class="flex flex-wrap gap-2 text-xs font-bold">
        <span class="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">{{ t('auth.import.total') }}: {{ result.total }}</span>
        <span class="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">{{ t('auth.import.valid') }}: {{ result.valid }}</span>
        <span class="px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300">{{ t('auth.import.invalid') }}: {{ result.invalid.length }}</span>
      </div>

      <p v-if="result.invalid.length" class="text-xs font-semibold text-red-700 dark:text-red-300">{{ t('auth.import.fixFirst') }}</p>
      <p v-else-if="canImport" class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{{ t('auth.import.ready') }}</p>

      <div v-if="result.invalid.length" class="overflow-x-auto rounded-xl border border-red-200 dark:border-red-400/20">
        <table class="w-full text-xs">
          <thead class="bg-red-50 dark:bg-red-500/10 text-left">
            <tr>
              <th class="px-3 py-2">{{ t('auth.import.line') }}</th>
              <th class="px-3 py-2">student_id</th>
              <th class="px-3 py-2">name</th>
              <th class="px-3 py-2">{{ t('auth.import.errors') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in result.invalid" :key="row.line" class="border-t border-red-100 dark:border-red-400/10">
              <td class="px-3 py-2 font-bold">{{ row.line }}</td>
              <td class="px-3 py-2">{{ row.data.student_id }}</td>
              <td class="px-3 py-2">{{ row.data.name }}</td>
              <td class="px-3 py-2 text-red-700 dark:text-red-300">{{ row.errors.join(', ') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import * as XLSX from 'xlsx'
import { memberAccountService } from '../services/memberAccountService'

defineProps({
  membershipTypes: { type: Array, default: () => [] },
})
const emit = defineEmits(['imported'])

const { t } = useI18n()
const toast = useToast()

const fileInput = ref(null)
const file = ref(null)
const result = ref(null)
const checked = ref(false)
const busy = ref(false)

const canImport = computed(() => checked.value && result.value && !result.value.invalid.length && result.value.valid > 0)

function onFile(event) {
  file.value = event.target.files?.[0] || null
  result.value = null
  checked.value = false
}

function downloadTemplate() {
  const rows = [
    ['student_id', 'name', 'name_en', 'gender', 'class_name', 'date_of_birth', 'membership_type', 'phone', 'email'],
    ['2024001', 'សុខ ដារា', 'Sok Dara', 'ប្រុស', '12A', '15/03/2008', 'student', '012345678', ''],
    ['T-0001', 'ចាន់ សុភា', 'Chan Sophea', 'ស្រី', '', '02/11/1990', 'teacher', '', 'sophea@example.com'],
  ]
  const sheet = XLSX.utils.aoa_to_sheet(rows)
  const book = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(book, sheet, 'members')
  XLSX.writeFile(book, 'members-import-template.xlsx')
}

async function send(dryRun) {
  busy.value = true
  try {
    const { data } = await memberAccountService.import(file.value, dryRun)
    result.value = data
    return data
  } catch (error) {
    // 422 with row errors still has a result body
    if (error.response?.data?.invalid) {
      result.value = error.response.data
    } else {
      toast.error(error.response?.data?.message || 'Error')
    }
    return null
  } finally {
    busy.value = false
  }
}

async function check() {
  const data = await send(true)
  checked.value = !!data
}

async function run() {
  const data = await send(false)
  if (data?.imported) {
    toast.success(data.message)
    checked.value = false
    file.value = null
    if (fileInput.value) fileInput.value.value = ''
    emit('imported')
  }
}
</script>
