<template>
  <div class="bg-gray-900 rounded-2xl overflow-hidden" style="height: 75vh;">
    <iframe
      v-if="fileUrl"
      :src="fileUrl"
      class="w-full h-full border-0"
      :title="t('digitalLibrary.reader.pdfViewerTitle')"
    ></iframe>
    <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
      {{ t('digitalLibrary.reader.noFileToPreview') }}
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({ fileUrl: { type: String, default: '' } })
</script>