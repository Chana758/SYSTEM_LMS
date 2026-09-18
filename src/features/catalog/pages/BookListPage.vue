<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION WITH MODERN DASHBOARD STAT CARDS ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">

      <!-- Top Title & Action Buttons -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">{{ t('catalog.pageTitle') }}</h1>
          <p class="text-xs font-medium text-slate-500 mt-1">{{ t('catalog.pageSubtitle') }}</p>
        </div>
        <div class="flex items-center gap-3">
          <router-link
            v-if="canManage"
            to="/books/categories"
            class="inline-flex items-center gap-2 bg-rose-600 border border-slate-300 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-2xs"
          >
            <RectangleStackIcon class="w-4 h-4 text-white"/>
            <span>{{ t('catalog.categories') }}</span>
          </router-link>
          <button
            v-if="canManage"
            @click="openCreateModal"
            class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span class="text-base leading-none">+</span>
            <span>{{ t('catalog.addNewBook') }}</span>
          </button>
        </div>
      </div>

      <!-- ============ 4 STAT CARDS ============ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">

        <!-- Card 1: Total -->
        <div class="bg-blue-600 rounded-2xl border border-blue-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <BookOpenIcon class="w-7 h-7"/>
            </div>
            <span class="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest bg-blue-700/50 px-2.5 py-1 rounded-full border border-blue-400/30">{{ t('catalog.statTotal') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-blue-100 tracking-wide">{{ t('catalog.statTotalDesc') }}</p>
          </div>
        </div>

        <!-- Card 2: Available -->
        <div class="bg-emerald-600 rounded-2xl border border-emerald-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <CheckCircleIcon class="w-7 h-7"/>
            </div>
            <span class="text-[10px] font-extrabold text-emerald-100 uppercase tracking-widest bg-emerald-700/50 px-2.5 py-1 rounded-full border border-emerald-400/30">{{ t('catalog.statAvailable') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ availableCount }}</p>
            <p class="text-[11px] font-bold text-emerald-100 tracking-wide">{{ t('catalog.statAvailableDesc') }}</p>
          </div>
        </div>

        <!-- Card 3: Trending -->
        <div class="bg-amber-600 rounded-2xl border border-amber-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <FireIcon class="w-7 h-7"/>
            </div>
            <span class="text-[10px] font-extrabold text-amber-100 uppercase tracking-widest bg-amber-700/50 px-2.5 py-1 rounded-full border border-amber-400/30">{{ t('catalog.statTrending') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ store.popularBooks.length }}</p>
            <p class="text-[11px] font-bold text-amber-100 tracking-wide">{{ t('catalog.statTrendingDesc') }}</p>
          </div>
        </div>

        <!-- Card 4: Categories -->
        <div class="bg-purple-600 rounded-2xl border border-purple-500 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <RectangleStackIcon class="w-7 h-7"/>
            </div>
            <span class="text-[10px] font-extrabold text-purple-100 uppercase tracking-widest bg-purple-700/50 px-2.5 py-1 rounded-full border border-purple-400/30">{{ t('catalog.statCategories') }}</span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ store.categories.length }}</p>
            <p class="text-[11px] font-bold text-purple-100 tracking-wide">{{ t('catalog.statCategoriesDesc') }}</p>
          </div>
        </div>

      </div>

    </div>

    <!-- ============ MOST BORROWED (CLEAN SHELF STYLE) ============ -->
    <div v-if="store.popularBooks.length" class="space-y-3">
      <div class="flex items-center justify-between px-1">
        <div class="flex items-center gap-2">
          <span class="text-base">🔥</span>
          <h2 class="font-serif text-base font-bold text-slate-900">{{ t('catalog.mostBorrowed') }}</h2>
          <span class="text-xs font-semibold text-slate-400">• {{ t('catalog.rankedByCheckouts') }}</span>
        </div>
      </div>

      <div class="rounded-2xl bg-white border border-slate-300 p-5 shadow-sm relative overflow-hidden">
        <div class="flex gap-5 overflow-x-auto pb-3 pt-2 no-scrollbar">
          <div
            v-for="(book, i) in store.popularBooks"
            :key="'pop-' + book.id"
            @click="goDetail(book.id)"
            class="flex-shrink-0 w-28 cursor-pointer group"
          >
            <div class="relative pt-2">
              <span
                class="absolute -top-1 left-1/2 -translate-x-1/2 z-20 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ring-2 ring-white"
                :class="rankBadgeClass(i)"
              >
                {{ i + 1 }}
              </span>

              <div class="relative rounded-xl overflow-hidden shadow-xs group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-300 bg-slate-100 aspect-[2/3]">
                <div class="absolute left-0 top-0 bottom-0 w-2 bg-black/15 z-10 pointer-events-none"></div>
                <img v-if="book.cover_image" :src="coverUrl(book.cover_image)" :alt="book.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
                  <span class="text-2xl opacity-60">📘</span>
                </div>
                <div class="absolute bottom-1.5 right-1.5 bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                  {{ book.borrows_count }}×
                </div>
              </div>
            </div>
            <p class="text-xs font-bold text-slate-800 mt-2 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors text-center">{{ book.title }}</p>
          </div>
        </div>
        <div class="absolute bottom-0 inset-x-0 h-1 bg-slate-100"></div>
      </div>
    </div>

    <!-- ============ TOOLBAR ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"/>
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="text"
            :placeholder="t('catalog.searchPlaceholder')"
            class="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:outline-emerald-600 transition-all shadow-2xs"
          />
        </div>

        <select
          v-model="store.filters.category_id"
          @change="store.fetchBooks()"
          class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer"
        >
          <option value="">{{ t('catalog.allCategories') }}</option>
          <option v-for="c in store.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <select
          v-model="store.filters.status"
          @change="store.fetchBooks()"
          class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:outline-emerald-600 transition-all shadow-2xs cursor-pointer min-w-[150px]"
        >
          <option value="">{{ t('catalog.allStatuses') }}</option>
          <option value="available">{{ t('catalog.statusAvailable') }}</option>
          <option value="damaged">{{ t('catalog.statusDamaged') }}</option>
          <option value="lost">{{ t('catalog.statusLost') }}</option>
          <option value="archived">{{ t('catalog.statusArchived') }}</option>
        </select>
      </div>
    </div>

    <!-- ============ BOOK GRID ============ -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
      <div v-if="store.loading" class="col-span-full py-20 flex flex-col items-center justify-center text-slate-400">
        <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ t('catalog.loadingBooks') }}</p>
      </div>

      <div v-else-if="!store.books.length" class="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
        <span class="text-4xl mb-2">📚</span>
        <p class="text-xs font-black uppercase tracking-wider text-slate-900">{{ t('catalog.noBooksFound') }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ t('catalog.adjustFilters') }}</p>
      </div>

      <div
        v-for="book in store.books"
        :key="book.id"
        class="bg-white rounded-2xl border border-slate-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
        @click="goDetail(book.id)"
      >
        <div class="p-3 pb-0">
          <div class="relative rounded-xl overflow-hidden bg-slate-100 aspect-[2/3]">
            <div class="absolute left-0 top-0 bottom-0 w-2 bg-black/15 z-10 pointer-events-none"></div>

            <img
              v-if="book.cover_image"
              :src="coverUrl(book.cover_image)"
              :alt="book.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-50 via-white to-slate-100">
              <span class="text-4xl opacity-50">📖</span>
              <span class="text-[10px] px-2 text-center text-slate-400 line-clamp-2 font-bold">{{ book.category?.name }}</span>
            </div>

            <!-- Status Badge -->
            <span
              class="absolute top-2.5 left-2.5 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-xs z-20 uppercase tracking-wider"
              :class="statusBadgeClass(book.status)"
            >
              {{ statusLabel(book.status) }}
            </span>

            <!-- Available Quantity Indicator -->
            <span
              class="absolute bottom-2.5 right-2.5 text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-xs backdrop-blur-md z-20"
              :class="book.available_qty > 0 ? 'bg-white/90 text-slate-900 border border-slate-200/50' : 'bg-slate-900/90 text-white'"
            >
              {{ book.available_qty }} / {{ book.total_qty }}
            </span>

            <!-- Out of stock overlay -->
            <div v-if="book.available_qty === 0" class="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] flex items-center justify-center z-10 p-4">
              <span class="text-white text-[10px] font-black uppercase tracking-wider border border-white/40 rounded-lg px-2.5 py-1 text-center shadow-md">{{ t('catalog.borrowedOut') }}</span>
            </div>
          </div>

          <div class="mt-3 px-1">
            <span class="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest block">{{ book.category?.name || 'General' }}</span>
            <h3 class="font-extrabold text-sm text-slate-900 line-clamp-1 mt-0.5 group-hover:text-emerald-700 transition-colors">{{ book.title }}</h3>
          </div>
        </div>

        <div class="p-4 pt-3 flex items-center justify-between mt-2 border-t border-slate-200 bg-slate-50/70">
          <div class="flex items-center gap-1">
            <span class="text-amber-400 text-xs">★</span>
            <span class="text-xs text-slate-900 font-extrabold">{{ Number(book.rating_avg || 0).toFixed(1) }}</span>
            <span class="text-[10px] text-slate-400 font-medium">({{ book.rating_count || 0 }})</span>
          </div>
          <span class="text-[11px] font-medium text-slate-500 truncate max-w-[50%]" :title="book.author">{{ book.author }}</span>
        </div>
      </div>
    </div>

    <!-- ============ PAGINATION ============ -->
    <div class="flex items-center justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page"
        :key="p"
        @click="store.fetchBooks(p)"
        class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        :class="p === store.pagination.current_page ? 'bg-emerald-700 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
      >
        {{ p }}
      </button>
    </div>

    <!-- ============ CREATE MODAL ============ -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900">{{ t('catalog.createBookModal.title') }}</h2>
            <p class="text-xs text-slate-500 mt-0.5">{{ t('catalog.createBookModal.subtitle') }}</p>
          </div>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
        </div>
        <BookForm :errors="store.errors" :loading="store.loading" @cancel="showCreateModal = false" @submit="handleCreate"/>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  MagnifyingGlassIcon, BookOpenIcon, CheckCircleIcon,
  FireIcon, RectangleStackIcon,
} from '@heroicons/vue/24/outline'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import BookForm from '../components/BookForm.vue'

const { t } = useI18n()
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
    available: 'bg-emerald-500 text-white shadow-xs',
    damaged: 'bg-amber-400 text-slate-950 shadow-xs',
    lost: 'bg-rose-500 text-white shadow-xs',
    archived: 'bg-slate-500 text-white shadow-xs',
  }[status] || 'bg-slate-400 text-white'
}

function statusLabel(status) {
  const map = {
    available: t('catalog.statusAvailable'),
    damaged: t('catalog.statusDamaged'),
    lost: t('catalog.statusLost'),
    archived: t('catalog.statusArchived'),
  }
  return map[status] || status
}

function rankBadgeClass(index) {
  return [
    'bg-amber-400 text-slate-950',
    'bg-slate-200 text-slate-700',
    'bg-amber-700 text-white',
  ][index] || 'bg-slate-100 text-slate-600'
}

onMounted(() => {
  store.fetchCategories()
  store.fetchBooks()
  store.fetchPopularBooks()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>