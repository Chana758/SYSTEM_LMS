<template>
  <div class="p-6">
    <h1 class="text-xl font-bold text-gray-800 mb-6">Settings</h1>

    <div class="flex gap-6">
      <SettingsNav />

      <div class="flex-1 space-y-6">
        <!-- Create backup -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
          <h2 class="text-lg font-bold text-gray-800 mb-2">Create Backup</h2>
          <p class="text-sm text-gray-500 mb-4">
            Generate a full database backup file for download.
          </p>
          <button
            @click="handleCreateBackup"
            :disabled="isCreating"
            class="px-5 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition disabled:opacity-50"
          >
            {{ isCreating ? 'Creating...' : 'Create & Download Backup' }}
          </button>
          <p v-if="createError" class="text-sm text-red-600 mt-3">{{ createError }}</p>
        </div>

        <!-- Restore backup -->
        <div class="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
          <h2 class="text-lg font-bold text-gray-800 mb-2">Restore Backup</h2>
          <p class="text-sm text-gray-500 mb-4">
            Upload a previously downloaded backup file to restore the system.
            <span class="text-red-600 font-medium">This will overwrite current data.</span>
          </p>

          <label
            class="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
            :class="{ 'opacity-50 pointer-events-none': isRestoring }"
          >
            {{ selectedFile ? selectedFile.name : 'Choose Backup File' }}
            <input
              type="file"
              accept=".sql,.zip"
              class="hidden"
              :disabled="isRestoring"
              @change="handleFileSelect"
            />
          </label>

          <button
            v-if="selectedFile"
            @click="handleRestore"
            :disabled="isRestoring"
            class="ml-3 px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {{ isRestoring ? 'Restoring...' : 'Confirm Restore' }}
          </button>

          <p v-if="restoreError" class="text-sm text-red-600 mt-3">{{ restoreError }}</p>
          <p v-if="restoreSuccess" class="text-sm text-green-600 mt-3">{{ restoreSuccess }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SettingsNav from '@/features/settings/components/SettingsNav.vue'
import backupService from '@/features/settings/services/backupService'

const isCreating = ref(false)
const createError = ref('')

const selectedFile = ref(null)
const isRestoring = ref(false)
const restoreError = ref('')
const restoreSuccess = ref('')

const handleCreateBackup = async () => {
  createError.value = ''
  isCreating.value = true

  try {
    const response = await backupService.createBackup()

    // Trigger browser download from blob response
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `backup-${Date.now()}.sql`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  } catch (error) {
    createError.value = error.response?.data?.message || 'Failed to create backup.'
  } finally {
    isCreating.value = false
  }
}

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0] || null
  restoreError.value = ''
  restoreSuccess.value = ''
}

const handleRestore = async () => {
  if (!selectedFile.value) return

  restoreError.value = ''
  restoreSuccess.value = ''
  isRestoring.value = true

  try {
    await backupService.restoreBackup(selectedFile.value)
    restoreSuccess.value = 'System restored successfully.'
    selectedFile.value = null
  } catch (error) {
    restoreError.value = error.response?.data?.message || 'Failed to restore backup.'
  } finally {
    isRestoring.value = false
  }
}
</script>