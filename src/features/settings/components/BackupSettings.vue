<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Create backup -->
    <div :class="panel">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-50 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <CircleStackIcon class="w-5 h-5 text-green-700 dark:text-emerald-300" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ t('settings.backup.createTitle') }}</h2>
          <p class="text-sm text-gray-400 dark:text-slate-400">{{ t('settings.backup.createSubtitle') }}</p>
        </div>
      </div>
      <button
        type="button"
        @click="handleCreateBackup" :disabled="isCreating"
        class="mt-4 w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
      >
        <span v-if="isCreating" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
        {{ isCreating ? t('settings.backup.creating') : t('settings.backup.createDownload') }}
      </button>
      <p v-if="createError" :class="errorCls">{{ createError }}</p>
    </div>

    <!-- Restore -->
    <div :class="panel">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-50 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
          <ArrowUpTrayIcon class="w-5 h-5 text-red-600 dark:text-rose-300" />
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-gray-800 dark:text-white">{{ t('settings.backup.restoreTitle') }}</h2>
          <p class="text-sm text-gray-400 dark:text-slate-400">
            {{ t('settings.backup.restoreSubtitle') }}
            <span class="text-red-600 dark:text-rose-300 font-medium">{{ t('settings.backup.overwriteWarning') }}</span>
          </p>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mt-4">
        <label
          class="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/15 text-gray-700 dark:text-slate-200 text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition min-w-0"
          :class="{ 'opacity-50 pointer-events-none': isRestoring }"
        >
          <DocumentArrowUpIcon class="w-4 h-4 flex-shrink-0" />
          <!-- FIX: long file names are truncated instead of overflowing the card -->
          <span class="truncate">{{ selectedFile ? selectedFile.name : t('settings.backup.chooseFile') }}</span>
          <input ref="fileInput" type="file" accept=".sql" class="hidden" :disabled="isRestoring" @change="handleFileSelect" />
        </label>

        <button
          v-if="selectedFile" type="button" @click="openConfirmModal" :disabled="isRestoring"
          class="px-5 py-3 sm:py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 cursor-pointer"
        >
          {{ isRestoring ? t('settings.backup.restoring') : t('settings.backup.confirmRestore') }}
        </button>
      </div>

      <p v-if="restoreError" :class="errorCls">{{ restoreError }}</p>
      <p v-if="restoreSuccess" class="text-sm text-green-700 dark:text-emerald-300 bg-green-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2 mt-3">{{ restoreSuccess }}</p>
    </div>

    <!-- History -->
    <div class="bg-white dark:bg-slate-900/40 rounded-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <h2 class="text-lg font-bold text-gray-800 dark:text-white px-4 sm:px-6 pt-4 sm:pt-6 pb-3">{{ t('settings.backup.historyTitle') }}</h2>

      <!-- ===== Phone: cards ===== -->
      <div class="md:hidden">
        <p v-if="!history.length" class="py-8 text-center text-sm text-gray-400 dark:text-slate-500">{{ t('settings.backup.noHistory') }}</p>
        <ul v-else class="divide-y divide-gray-100 dark:divide-white/5 border-t border-gray-100 dark:border-white/5">
          <li v-for="item in history" :key="item.id" class="px-4 py-3 space-y-1.5">
            <div class="flex items-start justify-between gap-3">
              <p class="font-mono text-xs text-gray-800 dark:text-slate-100 break-all">{{ item.file_name }}</p>
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0" :class="statusCls(item.status)">{{ item.status }}</span>
            </div>
            <p class="text-xs text-gray-500 dark:text-slate-400">
              <span class="capitalize">{{ item.type }}</span>
              · {{ item.performer?.name || '—' }}
            </p>
            <p class="text-xs text-gray-400 dark:text-slate-500">{{ formatDate(item.created_at) }}</p>
          </li>
        </ul>
      </div>

      <!-- ===== md+: table ===== -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm text-gray-700 dark:text-slate-200">
          <thead class="bg-gray-50 dark:bg-slate-900/60 text-gray-500 dark:text-slate-400 text-xs uppercase">
            <tr>
              <th class="text-left px-6 py-3">{{ t('settings.backup.colFileName') }}</th>
              <th class="text-left px-6 py-3">{{ t('settings.backup.colPerformedBy') }}</th>
              <th class="text-left px-6 py-3">{{ t('settings.backup.colType') }}</th>
              <th class="text-left px-6 py-3">{{ t('settings.backup.colStatus') }}</th>
              <th class="text-left px-6 py-3">{{ t('settings.backup.colDate') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in history" :key="item.id" class="border-t border-gray-50 dark:border-white/5">
              <td class="px-6 py-3 font-mono text-xs">{{ item.file_name }}</td>
              <td class="px-6 py-3">{{ item.performer?.name || '—' }}</td>
              <td class="px-6 py-3 capitalize">{{ item.type }}</td>
              <td class="px-6 py-3">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="statusCls(item.status)">{{ item.status }}</span>
              </td>
              <td class="px-6 py-3 text-gray-500 dark:text-slate-400">{{ formatDate(item.created_at) }}</td>
            </tr>
            <tr v-if="!history.length">
              <td colspan="5" class="py-8 text-center text-gray-400 dark:text-slate-500">{{ t('settings.backup.noHistory') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Confirm modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4"
      @click.self="closeConfirmModal"
    >
      <!-- FIX: max-h + overflow-y-auto so the modal never goes off-screen (keyboard / small phones) -->
      <div class="bg-white dark:bg-slate-800 border border-transparent dark:border-white/10 rounded-2xl p-5 sm:p-6 max-w-md w-full max-h-[90dvh] overflow-y-auto shadow-2xl">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-2">{{ t('settings.backup.confirmModal.title') }}</h3>
        <p class="text-sm text-gray-600 dark:text-slate-300 mb-4 break-words">
          {{ t('settings.backup.confirmModal.warning', { filename: selectedFile?.name }) }}
        </p>
        <p class="text-sm text-gray-700 dark:text-slate-200 mb-2">{{ t('settings.backup.confirmModal.typeToConfirm') }}</p>
        <input
          v-model="confirmText" type="text" placeholder="RESTORE"
          autocomplete="off" autocapitalize="characters"
          class="w-full border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900/60 text-gray-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:[color-scheme:dark] rounded-xl px-3.5 py-2.5 text-base sm:text-sm mb-4 outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
        />
        <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button type="button" @click="closeConfirmModal" class="px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition cursor-pointer">
            {{ t('settings.backup.confirmModal.cancel') }}
          </button>
          <button
            type="button"
            @click="confirmAndRestore"
            :disabled="confirmText !== 'RESTORE' || isRestoring"
            class="px-4 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {{ isRestoring ? t('settings.backup.restoring') : t('settings.backup.confirmModal.yesOverwrite') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CircleStackIcon, ArrowUpTrayIcon, DocumentArrowUpIcon } from '@heroicons/vue/24/outline'
import { backupService } from '@/features/settings/services/backupService'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Inside SettingsCard: lighter inner panels, tighter padding on phones
const panel = 'bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-gray-200 dark:border-white/10 p-4 sm:p-6'
const errorCls = 'text-sm text-red-600 dark:text-rose-300 bg-red-50 dark:bg-rose-500/10 rounded-lg px-3 py-2 mt-3'

const statusCls = (status) =>
  status === 'success'
    ? 'bg-green-50 text-green-700 dark:bg-emerald-500/15 dark:text-emerald-300'
    : 'bg-red-50 text-red-600 dark:bg-rose-500/15 dark:text-rose-300'

const fileInput = ref(null)
const isCreating = ref(false)
const createError = ref('')
const selectedFile = ref(null)
const isRestoring = ref(false)
const restoreError = ref('')
const restoreSuccess = ref('')
const history = ref([])

const showConfirmModal = ref(false)
const confirmText = ref('')

async function loadHistory() {
  try {
    const { data } = await backupService.getHistory()
    history.value = data.data
  } catch (e) {
    // history is secondary — fail silently
  }
}

function formatDate(d) {
  return new Date(d).toLocaleString()
}

onMounted(loadHistory)

async function handleCreateBackup() {
  createError.value = ''
  isCreating.value = true
  try {
    const response = await backupService.createBackup()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `backup-${Date.now()}.sql`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url) // FIX: free the blob URL
    await loadHistory()
  } catch (error) {
    createError.value = error.response?.data?.message || t('settings.backup.createError')
  } finally {
    isCreating.value = false
  }
}

function handleFileSelect(event) {
  selectedFile.value = event.target.files[0] || null
  restoreError.value = ''
  restoreSuccess.value = ''
}

function openConfirmModal() {
  if (!selectedFile.value) return
  confirmText.value = ''
  showConfirmModal.value = true
}

function closeConfirmModal() {
  showConfirmModal.value = false
  confirmText.value = ''
}

async function confirmAndRestore() {
  if (confirmText.value !== 'RESTORE') return

  restoreError.value = ''
  restoreSuccess.value = ''
  isRestoring.value = true

  try {
    await backupService.restoreBackup(selectedFile.value)
    restoreSuccess.value = t('settings.backup.restoreSuccessMsg')
    selectedFile.value = null
    // FIX: clear the native input, otherwise picking the same file again fires no change event
    if (fileInput.value) fileInput.value.value = ''
    showConfirmModal.value = false
    confirmText.value = ''
    await loadHistory()
  } catch (error) {
    restoreError.value = error.response?.data?.message || t('settings.backup.restoreError')
    // close the modal so the error message is visible
    showConfirmModal.value = false
    confirmText.value = ''
  } finally {
    isRestoring.value = false
  }
}
</script>