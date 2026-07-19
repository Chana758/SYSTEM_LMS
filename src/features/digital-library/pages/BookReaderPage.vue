<template>
  <div v-if="store.currentEbook && signedFileUrl">
    <div class="flex items-center justify-between mb-5">
      <router-link
        :to="{ name: 'library-detail-page', params: { id: store.currentEbook.id } }"
        class="text-gray-400 hover:text-gray-600 text-sm"
      >
        ← Back to details
      </router-link>
      <h1 class="text-sm font-semibold text-gray-700">{{ store.currentEbook.book?.title }}</h1>
      <DownloadButton :ebook="store.currentEbook" />
    </div>

    <EbookReader :ebook="store.currentEbook" :file-url="signedFileUrl" />
  </div>
  <div v-else class="text-center py-16 text-gray-400 text-sm">Loading...</div>
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