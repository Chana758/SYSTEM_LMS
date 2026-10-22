<template>
  <div class="space-y-2">
    <div class="bg-gray-900 dark:bg-slate-950 rounded-2xl overflow-hidden border border-transparent dark:border-white/10" style="height: 70dvh;">
      <iframe
        v-if="fileUrl"
        :src="fileUrl"
        class="w-full h-full border-0"
        :title="t('digitalLibrary.reader.pdfViewerTitle')"
      ></iframe>
      <div v-else class="flex items-center justify-center h-full text-gray-400 dark:text-slate-500 text-sm">
        {{ t('digitalLibrary.reader.noFileToPreview') }}
      </div>
    </div>

    <!-- Phones: open the PDF in the browser's own viewer for all pages and pinch-zoom -->
    <a
      v-if="fileUrl"
      :href="fileUrl"
      target="_blank"
      rel="noopener"
      class="sm:hidden flex items-center justify-center gap-2 w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider"
    >
      {{ t('digitalLibrary.reader.openFullscreen') }}
    </a>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
defineProps({ fileUrl: { type: String, default: '' } })
</script>