<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Digital Library</h1>
        <p class="text-sm text-gray-400 mt-0.5">Browse and read e-books directly online</p>
      </div>
      <div class="flex gap-2">
        <router-link
          v-if="!isStaff"
          :to="{ name: 'my-favorites-page' }"
          class="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium"
        >
          <HeartIcon class="w-4 h-4" /> My Favorites
        </router-link>
        <button
          v-if="isStaff"
          @click="showAddModal = true"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Add E-book
        </button>
      </div>
    </div>

    <div class="mb-5">
      <LibrarySearch @search="handleSearch" />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
      <CategorySidebar
        :categories="store.categories"
        :active-id="store.filters.category_id"
        @select="handleCategorySelect"
      />

      <div>
        <div v-if="store.loading" class="text-center py-16 text-gray-400 text-sm">Loading e-books...</div>

        <div v-else-if="!store.ebooks.length" class="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <BookOpenIcon class="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 text-sm">No e-books found.</p>
          <button
            v-if="isStaff"
            @click="showAddModal = true"
            class="mt-4 text-green-700 text-sm font-medium hover:underline"
          >
            + Add your first e-book
          </button>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          <BookPreviewCard v-for="e in store.ebooks" :key="e.id" :ebook="e" />
        </div>

        <div class="flex justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
          <button
            v-for="p in store.pagination.last_page" :key="p"
            @click="store.fetchEbooks(p)"
            class="w-8 h-8 rounded-lg text-sm transition-colors"
            :class="p === store.pagination.current_page ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50'"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </div>

    <EbookFormModal
      v-if="showAddModal"
      @saved="handleSaved"
      @cancel="showAddModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { BookOpenIcon, HeartIcon } from '@heroicons/vue/24/outline'
import { useLibraryStore } from '../store/libraryStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import LibrarySearch from '../components/LibrarySearch.vue'
import CategorySidebar from '../components/CategorySidebar.vue'
import BookPreviewCard from '../components/BookPreviewCard.vue'
import EbookFormModal from '../components/EbookFormModal.vue'

const store = useLibraryStore()
const authStore = useAuthStore()
const showAddModal = ref(false)

const isStaff = computed(() => ['admin', 'librarian'].includes(authStore.role))

function handleSearch(query) {
  store.filters.search = query
  store.fetchEbooks(1)
}

function handleCategorySelect(id) {
  store.filters.category_id = id
  store.fetchEbooks(1)
}

function handleSaved() {
  showAddModal.value = false
  store.fetchEbooks(1)
}

onMounted(() => {
  store.fetchCategories()
  store.fetchEbooks()
})
</script>