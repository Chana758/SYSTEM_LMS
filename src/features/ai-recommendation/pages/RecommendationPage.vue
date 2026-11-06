<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <div class="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <!-- Heading card: icon, title, and compact inline stats -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-lg dark:shadow-black/30 flex flex-wrap items-center justify-between gap-3 sm:gap-4 transition-colors">
        <div class="flex items-center gap-3 sm:gap-4 min-w-0">
          <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-green-800 dark:bg-gradient-to-br dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center flex-shrink-0">
            <SparklesIcon class="w-6 h-6 text-amber-400 dark:text-white" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-stone-800 dark:text-white tracking-tight">{{ t('recommendation.title') }}</h1>
            <p class="text-xs font-bold text-stone-400 dark:text-slate-400 mt-0.5">{{ t('recommendation.subtitle') }}</p>
          </div>
        </div>

        <!-- Phone: stats take their own full-width row under the title -->
        <div class="w-full sm:w-auto flex items-stretch gap-4 text-sm pt-3 sm:pt-0 border-t border-stone-100 dark:border-white/10 sm:border-0">
          <div>
            <p class="text-lg font-bold text-stone-800 dark:text-white leading-none">{{ store.books.length }}</p>
            <p class="text-xs text-stone-400 dark:text-slate-400 mt-1">{{ t('recommendation.sidebar.recommendedCount') }}</p>
          </div>
          <div class="w-px bg-stone-200 dark:bg-white/10"></div>
          <div>
            <p class="text-lg font-bold text-stone-800 dark:text-white leading-none">{{ categories.length || t('recommendation.sidebar.allCategoriesLabel') }}</p>
            <p class="text-xs text-stone-400 dark:text-slate-400 mt-1">{{ t('recommendation.sidebar.categoriesShown') }}</p>
          </div>
        </div>
      </div>

      <!-- Loading skeleton for the featured slot -->
      <div v-if="store.loading" class="rounded-2xl bg-stone-100 dark:bg-slate-800/50 animate-pulse h-56"></div>

      <!-- Featured pick -->
      <router-link
        v-else-if="featuredBook"
        :to="{ name: 'book-detail', params: { id: featuredBook.id } }"
        @click="store.trackClick(featuredBook.id)"
        class="group flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start bg-white dark:bg-slate-900 rounded-2xl border border-stone-200 dark:border-white/10 p-4 sm:p-6 hover:border-amber-300 dark:hover:border-emerald-400/40 hover:shadow-md dark:hover:shadow-black/40 transition-all"
      >
        <div class="w-28 sm:w-36 flex-shrink-0">
          <div class="aspect-[3/4] rounded-lg overflow-hidden shadow-lg bg-stone-50 dark:bg-slate-800 transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
            <img
              v-if="featuredCoverUrl"
              :src="featuredCoverUrl"
              class="w-full h-full object-cover"
              @error="featuredCoverFailed = true"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <BookOpenIcon class="w-8 h-8 text-stone-300 dark:text-slate-600" />
            </div>
          </div>
        </div>

        <div class="flex-1 min-w-0 text-center sm:text-left">
          <p v-if="reasonLabel" class="text-xs font-semibold text-amber-600 dark:text-amber-300 mb-1.5">{{ reasonLabel }}</p>
          <h2 class="text-lg font-bold text-stone-800 dark:text-white break-words">{{ featuredBook.title }}</h2>
          <p class="text-sm text-stone-400 dark:text-slate-400 mt-0.5">{{ featuredBook.author }}</p>

          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 mt-3">
            <span
              v-if="featuredBook.category?.name"
              class="text-xs font-medium text-green-700 dark:text-emerald-300 bg-green-50 dark:bg-emerald-500/15 border border-green-100 dark:border-emerald-400/25 rounded-full px-2.5 py-1"
            >
              {{ featuredBook.category.name }}
            </span>
            <span class="flex items-center gap-1 text-xs font-medium text-stone-600 dark:text-slate-300">
              <StarIcon class="w-3.5 h-3.5 text-amber-500 dark:text-amber-300" />
              {{ Number(featuredBook.rating_avg ?? 0).toFixed(1) }}
            </span>
          </div>
        </div>
      </router-link>

      <RecommendationFilter v-if="categories.length" v-model="selectedCategory" :categories="categories" />

      <RecommendationList
        :books="restBooks"
        :loading="store.loading"
        @book-click="store.trackClick"
      />

      <p v-if="store.error" class="text-sm text-red-600 dark:text-rose-400">{{ t('recommendation.genericError') }}</p>

      <div class="pt-5 border-t border-stone-200 dark:border-white/10 flex items-start gap-2 text-xs text-stone-400 dark:text-slate-400 max-w-xl">
        <SparklesIcon class="w-3.5 h-3.5 text-amber-500 dark:text-amber-300 flex-shrink-0 mt-0.5" />
        <p>{{ t('recommendation.sidebar.howItWorksBody') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { SparklesIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import { StarIcon } from '@heroicons/vue/24/solid'
import { useRecommendationStore } from '../store/recommendationStore'
import RecommendationFilter from '../components/RecommendationFilter.vue'
import RecommendationList from '../components/RecommendationList.vue'

const { t, te } = useI18n()
const store = useRecommendationStore()
const selectedCategory = ref('')
const featuredCoverFailed = ref(false)

const categories = computed(() =>
  [...new Set(store.books.map((b) => b.category?.name).filter(Boolean))]
)

const filteredBooks = computed(() =>
  selectedCategory.value
    ? store.books.filter((b) => b.category?.name === selectedCategory.value)
    : store.books
)

const featuredBook = computed(() => filteredBooks.value[0] ?? null)
const restBooks = computed(() => filteredBooks.value.slice(1))

const featuredCoverUrl = computed(() => {
  const book = featuredBook.value
  if (!book?.cover_image || featuredCoverFailed.value) return null
  if (/^https?:\/\//i.test(book.cover_image)) return book.cover_image
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${book.cover_image}`
})

const reasonLabel = computed(() => {
  if (!store.reason) return store.reasonLabel
  const key = `recommendation.reasonLabels.${store.reason}`
  return te(key) ? t(key) : store.reasonLabel
})

onMounted(() => store.fetchRecommendations())
</script>