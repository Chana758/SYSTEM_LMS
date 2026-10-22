<template>
  <div v-if="store.currentEbook && signedFileUrl" class="space-y-4 sm:space-y-6 pb-12">
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-3 sm:p-6 shadow-lg dark:shadow-black/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 transition-colors">
      <router-link
        :to="{ name: 'library-detail-page', params: { id: store.currentEbook.id } }"
        class="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/30 text-slate-700 dark:text-slate-200 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs w-fit"
      >
        <span>←</span> {{ t('digitalLibrary.reader.backToDetails') }}
      </router-link>

      <h1 class="text-sm font-black text-slate-900 dark:text-white tracking-tight sm:text-left line-clamp-1">
        {{ store.currentEbook.book?.title }}
      </h1>

      <div class="flex sm:justify-end">
        <DownloadButton :ebook="store.currentEbook" class="w-full sm:w-auto" />
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-2 sm:p-6 md:p-8 shadow-lg dark:shadow-black/30 space-y-6 border-dashed transition-colors">
      <div class="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-2 sm:p-6 shadow-2xs overflow-hidden">
        <EbookReader :ebook="store.currentEbook" :file-url="signedFileUrl" />
      </div>
    </div>
  </div>

  <div v-else class="text-center py-24 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
    {{ t('digitalLibrary.reader.loading') }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLibraryStore } from '../store/libraryStore'
import EbookReader from '../components/EbookReader.vue'
import DownloadButton from '../components/DownloadButton.vue'

const { t } = useI18n()
const route = useRoute()
const store = useLibraryStore()
const signedFileUrl = ref('')

onMounted(async () => {
  await store.fetchEbook(route.params.id)

  // Fetch a fresh 10-minute signed URL to actually load the file content —
  // the /show endpoint intentionally never returns the raw file path.
  const result = await store.downloadEbook(route.params.id)
  if (result.success) {
    signedFileUrl.value = result.file_url
  }
})
</script>