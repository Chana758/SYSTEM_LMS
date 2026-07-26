<template>
  <div v-if="store.currentEbook && signedFileUrl" class="space-y-6 pb-12">
    <!-- Top Bar with Back Link, Title, and Download Button -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <router-link
        :to="{ name: 'library-detail-page', params: { id: store.currentEbook.id } }"
        class="inline-flex items-center gap-2 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs w-fit"
      >
        <span>←</span> Back to details
      </router-link>
      
      <h1 class="text-sm font-black text-slate-900 tracking-tight text-center sm:text-left line-clamp-1">
        {{ store.currentEbook.book?.title }}
      </h1>

      <div class="flex justify-end">
        <DownloadButton :ebook="store.currentEbook" />
      </div>
    </div>

    <!-- Main Container matching Digital Library, Fines & Reservations Style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6 border-dashed">
      <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-200 p-4 sm:p-6 shadow-2xs overflow-hidden">
        <EbookReader :ebook="store.currentEbook" :file-url="signedFileUrl" />
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-24 text-slate-400 font-bold text-xs uppercase tracking-widest">
    Loading e-book reader...
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLibraryStore } from '../store/libraryStore'
import EbookReader from '../components/EbookReader.vue'
import DownloadButton from '../components/DownloadButton.vue'

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