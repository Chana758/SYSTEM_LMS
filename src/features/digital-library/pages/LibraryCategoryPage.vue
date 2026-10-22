<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-black/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <div class="w-11 h-11 sm:w-12 sm:h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          📂
        </div>
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ categoryName }}</h1>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('digitalLibrary.categoryPage.browseByCategory') }}</p>
        </div>
      </div>
      <router-link
        :to="{ name: 'library-home-page' }"
        class="inline-flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/30 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-2xs"
      >
        <span>←</span> {{ t('digitalLibrary.categoryPage.backToLibrary') }}
      </router-link>
    </div>

    <!-- Main Container -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-3 sm:p-6 md:p-8 shadow-lg dark:shadow-black/30 space-y-6 border-dashed transition-colors">

      <div v-if="store.loading" class="text-center py-16 sm:py-20 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
        {{ t('digitalLibrary.loadingEbooks') }}
      </div>

      <div v-else-if="!store.ebooks.length" class="bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-8 sm:p-16 text-center space-y-3 shadow-2xs">
        <div class="w-12 h-12 bg-emerald-50 dark:bg-emerald-500/15 border-2 border-emerald-200 dark:border-emerald-400/25 rounded-xl flex items-center justify-center mx-auto text-xl shadow-2xs text-emerald-600 dark:text-emerald-300">
          ✨
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">{{ t('digitalLibrary.noEbooksFound') }}</p>
          <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('digitalLibrary.categoryPage.noEbooksInCategory') }}</p>
        </div>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <BookPreviewCard v-for="e in store.ebooks" :key="e.id" :ebook="e" />
      </div>

      <!-- Pagination -->
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
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLibraryStore } from '../store/libraryStore'
import BookPreviewCard from '../components/BookPreviewCard.vue'

const { t } = useI18n()
const route = useRoute()
const store = useLibraryStore()

const categoryName = computed(() => {
  const found = store.categories.find((c) => String(c.id) === String(route.params.id))
  return found?.name || t('digitalLibrary.categories')
})

onMounted(async () => {
  if (!store.categories.length) await store.fetchCategories()
  store.filters.category_id = route.params.id
  store.fetchEbooks(1)
})
</script>