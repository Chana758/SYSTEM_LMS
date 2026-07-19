<template>
  <div>
    <!-- ============ HEADER ============ -->
    <div class="flex items-start justify-between mb-6">
      <h1 class="font-serif text-2xl font-bold text-gray-900">Book Management</h1>
      <div class="flex gap-2">
        <router-link
          v-if="canManage"
          to="/books/categories"
          class="border border-green-700 text-green-700 hover:bg-green-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Manage Categories
        </router-link>
        <button
          v-if="canManage"
          @click="openCreateModal"
          class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          + Add New Book
        </button>
      </div>
    </div>

    <!-- ============ STAT CARDS ============ -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
          <BookOpenIcon class="w-[18px] h-[18px] text-green-700" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.pagination.total || 0 }}</p>
          <p class="text-xs text-gray-500">Titles in catalog</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <CheckCircleIcon class="w-[18px] h-[18px] text-emerald-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ availableCount }}</p>
          <p class="text-xs text-gray-500">Available now</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <FireIcon class="w-[18px] h-[18px] text-amber-500" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.popularBooks.length }}</p>
          <p class="text-xs text-gray-500">Trending titles</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <RectangleStackIcon class="w-[18px] h-[18px] text-blue-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.categories.length }}</p>
          <p class="text-xs text-gray-500">Categories</p>
        </div>
      </div>
    </div>

    <!-- ============ MOST BORROWED — "on the shelf" ============ -->
    <div v-if="store.popularBooks.length" class="mb-10">
      <div class="flex items-baseline gap-2 mb-4">
        <span class="text-lg">🔥</span>
        <h2 class="font-serif text-base font-bold text-gray-800">Most Borrowed</h2>
        <span class="text-xs text-gray-400">ranked by all-time checkouts</span>
      </div>

      <div class="rounded-2xl bg-gradient-to-b from-amber-50/70 to-white border border-amber-100 p-5 pb-0 overflow-hidden">
        <div class="flex gap-6 overflow-x-auto pb-6">
          <div
            v-for="(book, i) in store.popularBooks"
            :key="'pop-' + book.id"
            @click="goDetail(book.id)"
            class="flex-shrink-0 w-28 cursor-pointer group pt-3"
          >
            <div class="relative">
              <!-- rank medal — sits above the cover, not overlapping it -->
              <span
                class="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm ring-2 ring-white"
                :class="rankBadgeClass(i)"
              >
                {{ i + 1 }}
              </span>

              <div
                class="relative rounded-md overflow-hidden shadow-md group-hover:shadow-xl group-hover:-translate-y-1.5 transition-all duration-300"
                style="aspect-ratio: 2 / 3;"
              >
                <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-black/15 z-10"></div>
                <img v-if="book.cover_image" :src="coverUrl(book.cover_image)" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 via-emerald-50 to-amber-50">
                  <span class="text-3xl opacity-60">📘</span>
                </div>
                <span class="absolute bottom-1.5 right-1.5 bg-amber-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">
                  {{ book.borrows_count }}×
                </span>
              </div>
            </div>
            <p class="text-xs font-semibold text-gray-700 mt-2 line-clamp-2 leading-snug">{{ book.title }}</p>
          </div>
        </div>

        <!-- shelf edge — full-bleed inside the card, no overflow issues -->
        <div class="h-3 -mx-5 bg-gradient-to-b from-amber-200 to-amber-300 shadow-[0_2px_4px_rgba(0,0,0,0.08)]"></div>
      </div>
    </div>

    <!-- ============ TOOLBAR ============ -->
    <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[220px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search title, author, ISBN..."
            class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-shadow"
          />
        </div>
        <select
          v-model="store.filters.category_id"
          @change="store.fetchBooks()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        >
          <option value="">All Categories</option>
          <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
        <select
          v-model="store.filters.status"
          @change="store.fetchBooks()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="damaged">Damaged</option>
          <option value="lost">Lost</option>
          <option value="archived">Archived</option>
        </select>
      </div>
    </div>

    <!-- ============ BOOK GRID (unchanged) ============ -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      <div v-if="store.loading" class="col-span-full text-center py-16 text-gray-400">Loading...</div>
      <div v-else-if="!store.books.length" class="col-span-full text-center py-16 text-gray-400">No books found</div>

      <div
        v-for="book in store.books"
        :key="book.id"
        class="group cursor-pointer"
        @click="goDetail(book.id)"
      >
        <div
          class="relative rounded-lg overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-2xl group-hover:-translate-y-1.5 transition-all duration-300 ease-out"
          style="aspect-ratio: 2 / 3;"
        >
          <div class="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/20 to-transparent z-10 pointer-events-none"></div>

          <img
            v-if="book.cover_image"
            :src="coverUrl(book.cover_image)"
            :alt="book.title"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 via-white to-amber-50 border border-gray-100">
            <span class="text-5xl opacity-70">📖</span>
            <span class="text-[11px] px-3 text-center text-gray-400 line-clamp-2">{{ book.category?.name }}</span>
          </div>

          <span
            class="absolute top-2 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm z-20 capitalize"
            :class="statusBadgeClass(book.status)"
          >
            {{ book.status }}
          </span>

          <span
            class="absolute bottom-2 right-2 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm backdrop-blur-sm z-20"
            :class="book.available_qty > 0 ? 'bg-white/90 text-green-700' : 'bg-black/70 text-white'"
          >
            {{ book.available_qty }}/{{ book.total_qty }}
          </span>

          <div v-if="book.available_qty === 0" class="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span class="text-white text-xs font-bold tracking-wide border border-white/60 rounded-full px-3 py-1">All Copies Borrowed</span>
          </div>

          <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
        </div>

        <div class="mt-2.5 px-0.5">
          <h3 class="font-serif font-semibold text-gray-800 text-sm leading-snug line-clamp-2 group-hover:text-green-800 transition-colors">
            {{ book.title }}
          </h3>
          <p class="text-xs text-gray-500 mt-0.5 truncate">{{ book.author }}</p>

          <div class="flex items-center justify-between mt-1.5">
            <div class="flex items-center gap-1">
              <span class="text-amber-400 text-xs">★</span>
              <span class="text-xs text-gray-600 font-medium">{{ Number(book.rating_avg || 0).toFixed(1) }}</span>
              <span class="text-xs text-gray-400">({{ book.rating_count || 0 }})</span>
            </div>
            <span class="text-[11px] text-gray-400 truncate max-w-[45%]">{{ book.category?.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-8" v-if="store.pagination.last_page > 1">
      <button v-for="p in store.pagination.last_page" :key="p" @click="store.fetchBooks(p)"
        class="w-8 h-8 rounded-lg text-sm transition-colors" :class="p === store.pagination.current_page ? 'bg-green-700 text-white' : 'bg-white border text-gray-600 hover:bg-green-50'">
        {{ p }}
      </button>
    </div>

    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">Add New Book</h2>
        <BookForm :loading="store.loading" :errors="store.errors" @submit="handleCreate" @cancel="showCreateModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon, BookOpenIcon, CheckCircleIcon,
  FireIcon, RectangleStackIcon,
} from '@heroicons/vue/24/outline'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import BookForm from '../components/BookForm.vue'

const router = useRouter()
const store = useCatalogStore()
const authStore = useAuthStore()
const showCreateModal = ref(false)

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))

const availableCount = computed(() => store.books.filter((b) => b.available_qty > 0).length)

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => store.fetchBooks(), 400)
}

function openCreateModal() {
  store.errors = {}
  showCreateModal.value = true
}

async function handleCreate(formData) {
  const result = await store.createBook(formData)
  if (result.success) {
    showCreateModal.value = false
    store.fetchBooks()
    store.fetchPopularBooks()
  }
}

function goDetail(id) {
  router.push({ name: 'book-detail', params: { id } })
}

function coverUrl(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}

function statusBadgeClass(status) {
  return {
    available: 'bg-green-500 text-white',
    damaged: 'bg-amber-500 text-white',
    lost: 'bg-red-500 text-white',
    archived: 'bg-gray-500 text-white',
  }[status] || 'bg-gray-400 text-white'
}

function rankBadgeClass(index) {
  return [
    'bg-amber-400 text-white',
    'bg-gray-300 text-gray-700',
    'bg-amber-700 text-white',
  ][index] || 'bg-gray-100 text-gray-500'
}

onMounted(() => {
  store.fetchCategories()
  store.fetchBooks()
  store.fetchPopularBooks()
})
</script>