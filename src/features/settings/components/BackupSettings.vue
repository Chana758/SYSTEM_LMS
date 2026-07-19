<template>
  <div class="space-y-6">
    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
          <CircleStackIcon class="w-5 h-5 text-green-700" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-800">Create Backup</h2>
          <p class="text-sm text-gray-400">Generate a full database backup file for download.</p>
        </div>
      </div>
      <button
        @click="handleCreateBackup" :disabled="isCreating"
        class="mt-4 px-5 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 transition disabled:opacity-50 inline-flex items-center gap-2"
      >
        <span v-if="isCreating" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
        {{ isCreating ? 'Creating...' : 'Create & Download Backup' }}
      </button>
      <p v-if="createError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{{ createError }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <ArrowUpTrayIcon class="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-gray-800">Restore Backup</h2>
          <p class="text-sm text-gray-400">
            Upload a previously downloaded backup file to restore the system.
            <span class="text-red-600 font-medium">This will overwrite current data.</span>
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-4">
        <label
          class="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
          :class="{ 'opacity-50 pointer-events-none': isRestoring }"
        >
          <DocumentArrowUpIcon class="w-4 h-4" />
          {{ selectedFile ? selectedFile.name : 'Choose Backup File' }}
          <input type="file" accept=".sql" class="hidden" :disabled="isRestoring" @change="handleFileSelect" />
        </label>

        <button
          v-if="selectedFile" @click="openConfirmModal" :disabled="isRestoring"
          class="px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50"
        >
          {{ isRestoring ? 'Restoring...' : 'Confirm Restore' }}
        </button>
      </div>

      <p v-if="restoreError" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-3">{{ restoreError }}</p>
      <p v-if="restoreSuccess" class="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-3">{{ restoreSuccess }}</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <h2 class="text-lg font-bold text-gray-800 px-6 pt-6 pb-3">Backup History</h2>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="text-left px-6 py-3">File Name</th>
            <th class="text-left px-6 py-3">Performed By</th>
            <th class="text-left px-6 py-3">Type</th>
            <th class="text-left px-6 py-3">Status</th>
            <th class="text-left px-6 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id" class="border-t border-gray-50">
            <td class="px-6 py-3 font-mono text-xs">{{ item.file_name }}</td>
            <td class="px-6 py-3">{{ item.performer?.name || '—' }}</td>
            <td class="px-6 py-3 capitalize">{{ item.type }}</td>
            <td class="px-6 py-3">
              <span class="px-2 py-0.5 rounded-full text-xs font-semibold" :class="item.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'">
                {{ item.status }}
              </span>
            </td>
            <td class="px-6 py-3 text-gray-500">{{ formatDate(item.created_at) }}</td>
          </tr>
          <tr v-if="!history.length">
            <td colspan="5" class="py-8 text-center text-gray-400">No backup history yet.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeConfirmModal"
    >
      <div class="bg-white rounded-2xl p-6 max-w-md w-full">
        <h3 class="text-lg font-bold text-gray-800 mb-2">Confirm Database Restore</h3>
        <p class="text-sm text-gray-600 mb-4">
          This will <span class="font-semibold text-red-600">permanently overwrite</span>
          all current data with the contents of
          <span class="font-medium">{{ selectedFile?.name }}</span>.
          This action cannot be undone.
        </p>
        <p class="text-sm text-gray-700 mb-2">
          Type <span class="font-mono font-semibold bg-gray-100 px-1.5 py-0.5 rounded">RESTORE</span> to confirm:
        </p>
        <input
          v-model="confirmText" type="text" placeholder="RESTORE"
          class="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm mb-4 outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
        />
        <div class="flex justify-end gap-3">
          <button @click="closeConfirmModal" class="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition">
            Cancel
          </button>
          <button
            @click="confirmAndRestore"
            :disabled="confirmText !== 'RESTORE' || isRestoring"
            class="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isRestoring ? 'Restoring...' : 'Yes, Overwrite Data' }}
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
    await loadHistory()
  } catch (error) {
    createError.value = error.response?.data?.message || 'Failed to create backup.'
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
    restoreSuccess.value = 'Database restored successfully.'
    selectedFile.value = null
    showConfirmModal.value = false
    confirmText.value = ''
    await loadHistory()
  } catch (error) {
    restoreError.value = error.response?.data?.message || 'Failed to restore backup.'
  } finally {
    isRestoring.value = false
  }
}
</script>