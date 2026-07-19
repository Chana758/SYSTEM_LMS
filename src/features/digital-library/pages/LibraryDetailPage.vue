<template>
  <div v-if="store.currentEbook">
    <router-link :to="{ name: 'library-home-page' }" class="text-gray-400 hover:text-gray-600 text-sm mb-5 inline-block">
      ← Digital Library
    </router-link>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col md:flex-row gap-6">
      <div class="w-full md:w-48 aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
        <img
          v-if="store.currentEbook.book?.cover_image"
          :src="coverUrl(store.currentEbook.book.cover_image)"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-4xl text-gray-300">📖</div>
      </div>

      <div class="flex-1">
        <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 mb-2">
          {{ store.currentEbook.book?.category?.name || '—' }}
        </span>
        <h1 class="text-2xl font-bold text-gray-800">{{ store.currentEbook.book?.title }}</h1>
        <p class="text-gray-500 mt-1">{{ store.currentEbook.book?.author }}</p>

        <div class="grid grid-cols-2 gap-4 mt-5 text-sm">
          <div>
            <p class="text-gray-400 text-xs uppercase mb-0.5">Format</p>
            <p class="text-gray-700 uppercase">{{ store.currentEbook.format }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase mb-0.5">Access</p>
            <p class="text-gray-700">{{ store.currentEbook.access_type === 'public' ? 'Public' : 'Members Only' }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase mb-0.5">Views</p>
            <p class="text-gray-700">{{ store.currentEbook.view_count }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-xs uppercase mb-0.5">Downloads</p>
            <p class="text-gray-700">{{ store.currentEbook.download_count }}</p>
          </div>
        </div>

        <div v-if="store.currentEbook.reading_progress" class="mt-4 bg-green-50 rounded-lg px-3 py-2 text-xs text-green-700">
          You're {{ Math.round(store.currentEbook.reading_progress.percentage) }}% through this book.
        </div>

        <p v-if="store.currentEbook.book?.description" class="text-sm text-gray-600 mt-5 leading-relaxed">
          {{ store.currentEbook.book.description }}
        </p>

        <div class="flex gap-3 mt-6">
          <router-link
            :to="{ name: 'book-reader-page', params: { id: store.currentEbook.id } }"
            class="flex items-center gap-2 border border-green-700 text-green-700 hover:bg-green-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <BookOpenIcon class="w-4 h-4" />
            {{ store.currentEbook.reading_progress ? 'Continue Reading' : 'Read Online' }}
          </router-link>
          <DownloadButton :ebook="store.currentEbook" />
          <FavoriteButton :ebook-id="store.currentEbook.id" :initial-favorited="store.currentEbook.is_favorited" />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-gray-400 text-sm">Loading...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { useLibraryStore } from '../store/libraryStore'
import DownloadButton from '../components/DownloadButton.vue'
import FavoriteButton from '../components/FavoriteButton.vue'

const route = useRoute()
const store = useLibraryStore()

function coverUrl(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}

onMounted(() => store.fetchEbook(route.params.id))
</script>