<template>
  <button
    @click="handleDownload"
    :disabled="!ebook.is_downloadable || loading"
    class="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
  >
    <ArrowDownTrayIcon class="w-4 h-4" />
    {{ loading ? t('digitalLibrary.download.preparing') : (ebook.is_downloadable ? t('digitalLibrary.download.download') : t('digitalLibrary.download.downloadUnavailable')) }}
  </button>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDownTrayIcon } from '@heroicons/vue/24/outline'
import { useLibraryStore } from '../store/libraryStore'

const { t } = useI18n()
const props = defineProps({ ebook: { type: Object, required: true } })
const store = useLibraryStore()
const loading = ref(false)

async function handleDownload() {
  loading.value = true
  const result = await store.downloadEbook(props.ebook.id)
  loading.value = false

  if (result.success) {
    window.open(result.file_url, '_blank')
  } else {
    alert(result.message)
  }
}
</script>