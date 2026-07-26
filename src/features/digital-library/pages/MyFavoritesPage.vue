<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          ❤️
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">My Favorites</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Quick access to your saved favorite e-books</p>
        </div>
      </div>
      <div>
        <router-link 
          :to="{ name: 'library-home-page' }" 
          class="inline-flex items-center gap-2 bg-slate-50 border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
        >
          <span>←</span> Back to Library
        </router-link>
      </div>
    </div>

    <!-- Main Container matching Digital Library, Fines & Reservations Style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6 border-dashed">
      
      <div v-if="store.loading" class="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest">
        Loading favorites...
      </div>

      <div v-else-if="!store.favorites.length" class="bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-16 text-center space-y-3 shadow-2xs">
        <div class="w-12 h-12 bg-rose-50 border-2 border-rose-200 rounded-xl flex items-center justify-center mx-auto text-xl shadow-2xs text-rose-500">
          <HeartIcon class="w-6 h-6" />
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 uppercase tracking-wider">No Favorites Yet</p>
          <p class="text-xs font-bold text-slate-500 mt-0.5">You haven't added any e-books to your favorites list.</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <BookPreviewCard v-for="f in store.favorites" :key="f.id" :ebook="f.ebook" />
      </div>

      <!-- Pagination -->
      <div class="flex justify-center gap-2 pt-4" v-if="store.favPagination.last_page > 1">
        <button
          v-for="p in store.favPagination.last_page" :key="p"
          @click="store.fetchFavorites(p)"
          class="w-9 h-9 rounded-xl text-xs font-black transition-all shadow-2xs"
          :class="p === store.favPagination.current_page ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-md' : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'"
        >
          {{ p }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useLibraryStore } from '../store/libraryStore'
import BookPreviewCard from '../components/BookPreviewCard.vue'

const store = useLibraryStore()
onMounted(() => store.fetchFavorites())
</script>