<template>
  <div>
    <PdfViewer v-if="ebook.format === 'pdf'" :file-url="fileUrl" />

    <EpubViewer
      v-else-if="ebook.format === 'epub'"
      :file-url="fileUrl"
      :ebook-id="ebook.id"
      :initial-location="ebook.reading_progress ? null : null"
    />

    <div v-else class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 p-10 text-center">
      <BookOpenIcon class="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
      <p class="text-gray-500 dark:text-slate-300 text-sm mb-1">
        {{ t('digitalLibrary.reader.mobiNotSupported') }}
      </p>
      <p class="text-gray-400 dark:text-slate-500 text-xs">{{ t('digitalLibrary.reader.downloadToRead') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import PdfViewer from './PdfViewer.vue'
import EpubViewer from './EpubViewer.vue'

const { t } = useI18n()

defineProps({
  ebook: { type: Object, required: true },
  fileUrl: { type: String, required: true }, // signed URL fetched by the page before rendering
})
</script>