<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          📚
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Digital Library</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Browse and read e-books directly online</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <router-link
          v-if="!isStaff"
          :to="{ name: 'my-favorites-page' }"
          class="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
        >
          <HeartIcon class="w-4 h-4 text-rose-500" /> My Favorites
        </router-link>
        <button
          v-if="isStaff"
          @click="showAddModal = true"
          class="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          + Add E-book
        </button>
      </div>
    </div>

    <!-- Main Container with Dashed Inner Border matching Reservations & My Fines Style -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6 border-dashed">
      
      <!-- Search Bar Inside Container -->
      <div>
        <LibrarySearch @search="handleSearch" />
      </div>

      <!-- Layout Grid: Category Sidebar & Books Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start pt-2">
        
        <!-- Category Sidebar Box -->
        <div class="bg-slate-50/70 rounded-2xl border-2 border-slate-200 p-4 space-y-3 shadow-2xs">
          <h3 class="text-xs font-black text-slate-900 uppercase tracking-wider px-2">Categories</h3>
          <CategorySidebar
            :categories="store.categories"
            :active-id="store.filters.category_id"
            @select="handleCategorySelect"
          />
        </div>

        <!-- Books Section -->
        <div class="space-y-6">
          <div v-if="store.loading" class="text-center py-20 text-slate-400 font-bold text-xs uppercase tracking-widest">
            Loading e-books...
          </div>

          <div v-else-if="!store.ebooks.length" class="bg-slate-50/50 rounded-2xl border-2 border-slate-200 p-16 text-center space-y-3 shadow-2xs">
            <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center mx-auto text-xl shadow-2xs text-emerald-600">
              📖
            </div>
            <div>
              <p class="text-sm font-black text-slate-900 uppercase tracking-wider">No e-books found</p>
              <p class="text-xs font-bold text-slate-500 mt-0.5">Try searching with a different keyword or category.</p>
            </div>
            <button
              v-if="isStaff"
              @click="showAddModal = true"
              class="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider hover:underline"
            >
              + Add your first e-book
            </button>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            <BookPreviewCard v-for="e in store.ebooks" :key="e.id" :ebook="e" />
          </div>

          <!-- Pagination -->
          <div class="flex justify-center gap-2 pt-4" v-if="store.pagination.last_page > 1">
            <button
              v-for="p in store.pagination.last_page" :key="p"
              @click="store.fetchEbooks(p)"
              class="w-9 h-9 rounded-xl text-xs font-black transition-all shadow-2xs"
              :class="p === store.pagination.current_page ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-md' : 'bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'"
            >
              {{ p }}
            </button>
          </div>
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