<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-black/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          📚
        </div>
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('digitalLibrary.pageTitle') }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('digitalLibrary.pageSubtitle') }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <router-link
          v-if="!isStaff"
          :to="{ name: 'my-favorites-page' }"
          class="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 hover:border-slate-300 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
        >
          <HeartIcon class="w-4 h-4 text-rose-500 dark:text-rose-400" /> {{ t('digitalLibrary.myFavorites') }}
        </router-link>
        <button
          v-if="isStaff"
          @click="showAddModal = true"
          class="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          {{ t('digitalLibrary.addEbook') }}
        </button>
      </div>
    </div>

    <!-- Main Container -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-3 sm:p-6 md:p-8 shadow-lg dark:shadow-black/30 space-y-4 sm:space-y-6 border-dashed transition-colors">

      <div>
        <LibrarySearch @search="handleSearch" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 sm:gap-6 items-start pt-1 sm:pt-2">

        <!-- Categories: horizontal chips on phones, vertical list on desktop -->
        <div class="min-w-0 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-3 sm:p-4 space-y-3 shadow-2xs">
          <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider px-2">{{ t('digitalLibrary.categories') }}</h3>
          <CategorySidebar
            :categories="store.categories"
            :active-id="store.filters.category_id"
            @select="handleCategorySelect"
          />
        </div>

        <div class="space-y-4 sm:space-y-6 min-w-0">
          <div v-if="store.loading" class="text-center py-16 sm:py-20 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
            {{ t('digitalLibrary.loadingEbooks') }}
          </div>

          <div v-else-if="!store.ebooks.length" class="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-8 sm:p-16 text-center space-y-3 shadow-2xs">
            <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center mx-auto text-xl shadow-2xs text-emerald-600 dark:text-emerald-300">
              📖
            </div>
            <div>
              <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{{ t('digitalLibrary.noEbooksFound') }}</p>
              <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('digitalLibrary.adjustSearchOrCategory') }}</p>
            </div>
            <button
              v-if="isStaff"
              @click="showAddModal = true"
              class="mt-2 inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-200 uppercase tracking-wider hover:underline"
            >
              {{ t('digitalLibrary.addFirstEbook') }}
            </button>
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            <BookPreviewCard v-for="e in store.ebooks" :key="e.id" :ebook="e" />
          </div>

          <div class="flex flex-wrap justify-center gap-2 pt-2 sm:pt-4" v-if="store.pagination.last_page > 1">
            <button
              v-for="p in store.pagination.last_page" :key="p"
              @click="store.fetchEbooks(p)"
              class="w-9 h-9 rounded-xl text-xs font-black transition-all shadow-2xs cursor-pointer"
              :class="p === store.pagination.current_page
                ? 'bg-emerald-600 text-white border-2 border-emerald-700 dark:border-emerald-400/40 shadow-md'
                : 'bg-white dark:bg-slate-800/50 border-2 border-slate-200 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300'"
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
import { useI18n } from 'vue-i18n'
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useLibraryStore } from '../store/libraryStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import LibrarySearch from '../components/LibrarySearch.vue'
import CategorySidebar from '../components/CategorySidebar.vue'
import BookPreviewCard from '../components/BookPreviewCard.vue'
import EbookFormModal from '../components/EbookFormModal.vue'

const { t } = useI18n()
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