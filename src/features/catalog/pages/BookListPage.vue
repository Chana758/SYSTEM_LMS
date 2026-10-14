<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER + STAT CARDS ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">
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
            <RectangleStackIcon class="w-4 h-4 text-white" />
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

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        <div
          v-for="s in stats"
          :key="s.key"
          class="rounded-2xl border shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md text-white"
          :class="s.card"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm">
              <component :is="s.icon" class="w-7 h-7" />
            </div>
            <span class="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border" :class="s.tag">
              {{ t(`catalog.stat${s.key}`) }}
            </span>
          </div>
          <div>
            <p class="text-2xl font-black text-white tracking-tight leading-none mb-1.5">{{ s.value }}</p>
            <p class="text-[11px] font-bold tracking-wide" :class="s.desc">{{ t(`catalog.stat${s.key}Desc`) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ MOST BORROWED ============ -->
    <div v-if="store.popularBooks.length" class="space-y-3">
      <div class="flex items-center gap-2 px-1">
        <span class="text-base">🔥</span>
        <h2 class="font-serif text-base font-bold text-slate-900">{{ t('catalog.mostBorrowed') }}</h2>
        <span class="text-xs font-semibold text-slate-400">• {{ t('catalog.rankedByCheckouts') }}</span>
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
              >{{ i + 1 }}</span>

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

    <!-- ============ FILTER ============ -->
    <BookFilter v-model="store.filters" :categories="store.categories" @change="onFilter">
      <template #extra>
        <div class="flex rounded-xl border border-slate-300 overflow-hidden">
          <button
            type="button"
            class="p-2.5 cursor-pointer transition"
            :class="viewMode === 'grid' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'"
            @click="viewMode = 'grid'"
          ><Squares2X2Icon class="w-4 h-4" /></button>
          <button
            type="button"
            class="p-2.5 cursor-pointer transition"
            :class="viewMode === 'table' ? 'bg-emerald-700 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'"
            @click="viewMode = 'table'"
          ><ListBulletIcon class="w-4 h-4" /></button>
        </div>
      </template>
    </BookFilter>

    <!-- ============ BOOKS ============ -->
    <template v-if="viewMode === 'grid'">
      <div v-if="store.loading" class="py-20 flex flex-col items-center justify-center text-slate-400">
        <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ t('catalog.loadingBooks') }}</p>
      </div>

      <div v-else-if="!store.books.length" class="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
        <span class="text-4xl mb-2">📚</span>
        <p class="text-xs font-black uppercase tracking-wider text-slate-900">{{ t('catalog.noBooksFound') }}</p>
        <p class="text-xs text-slate-400 mt-1">{{ t('catalog.adjustFilters') }}</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <BookCard v-for="book in store.books" :key="book.id" :book="book" @select="(b) => goDetail(b.id)" />
      </div>
    </template>

    <BookTable
      v-else
      :books="store.books"
      :loading="store.loading"
      :can-manage="canManage"
      @select="(b) => goDetail(b.id)"
      @edit="(b) => goDetail(b.id)"
      @delete="handleDelete"
    />

    <!-- ============ PAGINATION ============ -->
    <div v-if="store.pagination.last_page > 1" class="flex items-center justify-center gap-2 pt-2">
      <button
        class="w-9 h-9 rounded-xl border border-slate-300 bg-white disabled:opacity-40 cursor-pointer flex items-center justify-center"
        :disabled="store.pagination.current_page <= 1"
        @click="goPage(store.pagination.current_page - 1)"
      ><ChevronLeftIcon class="w-4 h-4" /></button>

      <button
        v-for="p in pageWindow"
        :key="p"
        @click="goPage(p)"
        class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        :class="p === store.pagination.current_page ? 'bg-emerald-700 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
      >{{ p }}</button>

      <button
        class="w-9 h-9 rounded-xl border border-slate-300 bg-white disabled:opacity-40 cursor-pointer flex items-center justify-center"
        :disabled="store.pagination.current_page >= store.pagination.last_page"
        @click="goPage(store.pagination.current_page + 1)"
      ><ChevronRightIcon class="w-4 h-4" /></button>
    </div>

    <!-- ============ CREATE MODAL ============ -->
    <BaseModal
      v-model="showCreateModal"
      :title="t('catalog.createBookModal.title')"
      :subtitle="t('catalog.createBookModal.subtitle')"
      size="lg"
    >
      <BookForm :errors="store.errors" :loading="store.loading" @cancel="showCreateModal = false" @submit="handleCreate" />
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import {
  BookOpenIcon, CheckCircleIcon, FireIcon, RectangleStackIcon,
  Squares2X2Icon, ListBulletIcon, ChevronLeftIcon, ChevronRightIcon,
} from '@heroicons/vue/24/outline'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { coverUrl } from '@/utils/coverUrl'
import BaseModal from '@/components/common/BaseModal.vue'
import BookForm from '../components/BookForm.vue'
import BookCard from '../components/BookCard.vue'
import BookFilter from '../components/BookFilter.vue'
import BookTable from '../components/BookTable.vue'

const { t } = useI18n()
const router = useRouter()
const toast = useToast()
const store = useCatalogStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const viewMode = ref('grid')

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))
const availableCount = computed(() => store.books.filter((b) => b.available_qty > 0).length)

const stats = computed(() => [
  { key: 'Total', icon: BookOpenIcon, value: store.pagination.total || 0,
    card: 'bg-blue-600 border-blue-500', tag: 'text-blue-100 bg-blue-700/50 border-blue-400/30', desc: 'text-blue-100' },
  { key: 'Available', icon: CheckCircleIcon, value: availableCount.value,
    card: 'bg-emerald-600 border-emerald-500', tag: 'text-emerald-100 bg-emerald-700/50 border-emerald-400/30', desc: 'text-emerald-100' },
  { key: 'Trending', icon: FireIcon, value: store.popularBooks.length,
    card: 'bg-amber-600 border-amber-500', tag: 'text-amber-100 bg-amber-700/50 border-amber-400/30', desc: 'text-amber-100' },
  { key: 'Categories', icon: RectangleStackIcon, value: store.categories.length,
    card: 'bg-purple-600 border-purple-500', tag: 'text-purple-100 bg-purple-700/50 border-purple-400/30', desc: 'text-purple-100' },
])

const pageWindow = computed(() => {
  const { current_page: c, last_page: l } = store.pagination
  const start = Math.max(1, Math.min(c - 2, l - 4))
  const end = Math.min(l, start + 4)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

function onFilter() { store.fetchBooks(1) }

function goPage(p) {
  if (p < 1 || p > store.pagination.last_page) return
  store.fetchBooks(p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goDetail(id) { router.push({ name: 'book-detail', params: { id } }) }

function openCreateModal() {
  store.errors = {}
  showCreateModal.value = true
}

async function handleCreate(formData) {
  const result = await store.createBook(formData)
  if (result.success) {
    toast.success(result.message)
    showCreateModal.value = false
    store.fetchBooks(1)
    store.fetchPopularBooks()
  } else {
    toast.error(result.message)
  }
}

async function handleDelete(book) {
  if (!window.confirm(t('catalog.confirmDeleteBook', { title: book.title }))) return
  const result = await store.deleteBook(book.id)
  if (result.success) {
    toast.success(result.message)
    store.fetchBooks()
  } else {
    toast.error(result.message)
  }
}

function rankBadgeClass(index) {
  return ['bg-amber-400 text-slate-950', 'bg-slate-200 text-slate-700', 'bg-amber-700 text-white'][index]
    || 'bg-slate-100 text-slate-600'
}

onMounted(() => {
  store.fetchCategories()
  store.fetchBooks()
  store.fetchPopularBooks()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>