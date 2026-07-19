<template>
  <div>
    <div class="flex items-center gap-3 mb-6">
      <router-link :to="{ name: 'library-home-page' }" class="text-gray-400 hover:text-gray-600 text-sm">
        ← Digital Library
      </router-link>
      <h1 class="text-xl font-bold text-gray-800">{{ categoryName }}</h1>
    </div>

    <div v-if="store.loading" class="text-center py-16 text-gray-400 text-sm">Loading...</div>

    <div v-else-if="!store.ebooks.length" class="bg-white rounded-2xl border border-gray-200 p-16 text-center text-gray-400 text-sm">
      No e-books found in this category.
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
      <BookPreviewCard v-for="e in store.ebooks" :key="e.id" :ebook="e" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useLibraryStore } from '../store/libraryStore'
import BookPreviewCard from '../components/BookPreviewCard.vue'

const route = useRoute()
const store = useLibraryStore()

const categoryName = computed(() => {
  const found = store.categories.find((c) => String(c.id) === String(route.params.id))
  return found?.name || 'Category'
})

onMounted(async () => {
  if (!store.categories.length) await store.fetchCategories()
  store.filters.category_id = route.params.id
  store.fetchEbooks(1)
})
</script>