<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <router-link :to="{ name: 'library-home-page' }" class="text-gray-400 hover:text-gray-600 text-sm">
        ← Digital Library
      </router-link>
      <h1 class="text-xl font-bold text-gray-800">My Favorites</h1>
    </div>

    <div v-if="store.loading" class="text-center py-16 text-gray-400 text-sm">Loading...</div>

    <div v-else-if="!store.favorites.length" class="bg-white rounded-2xl border border-gray-200 p-16 text-center">
      <HeartIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p class="text-gray-500 text-sm">You haven't favorited any e-books yet.</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      <BookPreviewCard v-for="f in store.favorites" :key="f.id" :ebook="f.ebook" />
    </div>

    <div class="flex justify-center gap-2 mt-6" v-if="store.favPagination.last_page > 1">
      <button
        v-for="p in store.favPagination.last_page" :key="p"
        @click="store.fetchFavorites(p)"
        class="w-8 h-8 rounded-lg text-sm transition-colors"
        :class="p === store.favPagination.current_page ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50'"
      >
        {{ p }}
      </button>
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