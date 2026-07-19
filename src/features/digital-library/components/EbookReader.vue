<template>
  <div>
    <PdfViewer v-if="ebook.format === 'pdf'" :file-url="fileUrl" />

    <EpubViewer
      v-else-if="ebook.format === 'epub'"
      :file-url="fileUrl"
      :ebook-id="ebook.id"
      :initial-location="ebook.reading_progress ? null : null"
    />

    <div v-else class="bg-white rounded-2xl border border-gray-200 p-10 text-center">
      <BookOpenIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 text-sm mb-1">
        MOBI format preview isn't supported in-browser.
      </p>
      <p class="text-gray-400 text-xs">Please download the file to read it on your device.</p>
    </div>
  </div>
</template>

<script setup>
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import PdfViewer from './PdfViewer.vue'
import EpubViewer from './EpubViewer.vue'

defineProps({
  ebook: { type: Object, required: true },
  fileUrl: { type: String, required: true }, // signed URL fetched by the page before rendering
})
</script>