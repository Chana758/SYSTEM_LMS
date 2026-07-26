<template>
  <div v-if="store.currentEbook" class="space-y-6 pb-12">
    <!-- Back Link with matching badge/card box style -->
    <div class="inline-block">
      <router-link 
        :to="{ name: 'library-home-page' }" 
        class="inline-flex items-center gap-2 bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
      >
        <span>←</span> Digital Library
      </router-link>
    </div>

    <!-- Main Container matching Digital Library, Fines & Reservations Style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-8 border-dashed">
      
      <!-- Top Detail Card Section -->
      <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-200 p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row gap-8 items-start">
        
        <!-- Book Cover Box -->
        <div class="w-full md:w-56 aspect-[3/4] rounded-xl overflow-hidden bg-white border-2 border-slate-200 flex-shrink-0 shadow-sm relative">
          <img
            v-if="store.currentEbook.book?.cover_image"
            :src="coverUrl(store.currentEbook.book.cover_image)"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-4xl text-slate-300 bg-slate-50">📖</div>
        </div>

        <!-- Book Info & Meta -->
        <div class="flex-1 space-y-4 w-full">
          <div>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border-2 border-emerald-200 mb-3 shadow-2xs">
              {{ store.currentEbook.book?.category?.name || '—' }}
            </span>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{{ store.currentEbook.book?.title }}</h1>
            <p class="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Author: <span class="text-slate-700">{{ store.currentEbook.book?.author }}</span></p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div class="bg-white rounded-xl border-2 border-slate-200 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Format</p>
              <p class="text-xs font-black text-slate-800 uppercase mt-0.5">{{ store.currentEbook.format }}</p>
            </div>
            <div class="bg-white rounded-xl border-2 border-slate-200 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Access</p>
              <p class="text-xs font-black text-slate-800 capitalize mt-0.5">{{ store.currentEbook.access_type === 'public' ? 'Public' : 'Members Only' }}</p>
            </div>
            <div class="bg-white rounded-xl border-2 border-slate-200 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Views</p>
              <p class="text-xs font-black text-slate-800 mt-0.5">{{ store.currentEbook.view_count }}</p>
            </div>
            <div class="bg-white rounded-xl border-2 border-slate-200 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Downloads</p>
              <p class="text-xs font-black text-slate-800 mt-0.5">{{ store.currentEbook.download_count }}</p>
            </div>
          </div>

          <!-- Reading Progress Banner -->
          <div v-if="store.currentEbook.reading_progress" class="bg-emerald-50 rounded-xl border-2 border-emerald-200 px-4 py-3 text-xs font-black text-emerald-800 shadow-2xs flex items-center gap-2">
            <span>✨</span>
            <span>You're {{ Math.round(store.currentEbook.reading_progress.percentage) }}% through this book.</span>
          </div>

          <!-- Description -->
          <div class="pt-2">
            <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider mb-1">Description</h3>
            <p v-if="store.currentEbook.book?.description" class="text-xs font-bold text-slate-600 leading-relaxed">
              {{ store.currentEbook.book.description }}
            </p>
            <p v-else class="text-xs font-bold text-slate-400 italic">No description available for this e-book.</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-200/80">
            <router-link
              :to="{ name: 'book-reader-page', params: { id: store.currentEbook.id } }"
              class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
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
  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-24 text-slate-400 font-bold text-xs uppercase tracking-widest">
    Loading e-book details...
  </div>
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