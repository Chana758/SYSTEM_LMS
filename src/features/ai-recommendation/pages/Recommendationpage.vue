<template>
  <div class="min-h-full bg-stone-50 p-6 lg:p-8">
    <div class="max-w-5xl mx-auto">
      <!-- Heading: icon, title, and compact inline stats — no boxed stat card -->
      <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-green-800 flex items-center justify-center flex-shrink-0">
            <SparklesIcon class="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-stone-800">{{ t('recommendation.title') }}</h1>
            <p class="text-sm text-stone-400 mt-0.5">{{ t('recommendation.subtitle') }}</p>
          </div>
        </div>

        <div class="flex items-stretch gap-4 text-sm">
          <div>
            <p class="text-lg font-bold text-stone-800 leading-none">{{ store.books.length }}</p>
            <p class="text-xs text-stone-400 mt-1">{{ t('recommendation.sidebar.recommendedCount') }}</p>
          </div>
          <div class="w-px bg-stone-200"></div>
          <div>
            <p class="text-lg font-bold text-stone-800 leading-none">{{ categories.length || t('recommendation.sidebar.allCategoriesLabel') }}</p>
            <p class="text-xs text-stone-400 mt-1">{{ t('recommendation.sidebar.categoriesShown') }}</p>
          </div>
        </div>
      </div>

      <!-- Loading skeleton for the featured slot -->
      <div v-if="store.loading" class="mb-8 rounded-2xl bg-stone-100 animate-pulse h-56"></div>

      <!-- Featured pick: the top recommendation, spotlighted like a book pulled off the shelf -->
      <router-link
        v-else-if="featuredBook"
        :to="{ name: 'book-detail', params: { id: featuredBook.id } }"
        @click="store.trackClick(featuredBook.id)"
        class="group mb-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start bg-white rounded-2xl border border-stone-200 p-6 hover:border-amber-300 hover:shadow-md transition-all"
      >
        <div class="w-32 sm:w-36 flex-shrink-0">
          <div class="aspect-[3/4] rounded-lg overflow-hidden shadow-lg bg-stone-50 transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
            <img
              v-if="featuredCoverUrl"
              :src="featuredCoverUrl"
              class="w-full h-full object-cover"
              @error="featuredCoverFailed = true"
            />
            <div v-else class="w-full h-full flex items-center justify-center">
              <BookOpenIcon class="w-8 h-8 text-stone-300" />
            </div>
          </div>
        </div>

        <div class="flex-1 text-center sm:text-left">
          <p v-if="reasonLabel" class="text-xs font-semibold text-amber-600 mb-1.5">{{ reasonLabel }}</p>
          <h2 class="text-lg font-bold text-stone-800">{{ featuredBook.title }}</h2>
          <p class="text-sm text-stone-400 mt-0.5">{{ featuredBook.author }}</p>

          <div class="flex items-center justify-center sm:justify-start gap-3 mt-3">
            <span
              v-if="featuredBook.category?.name"
              class="text-xs font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-2.5 py-1"
            >
              {{ featuredBook.category.name }}
            </span>
            <span class="flex items-center gap-1 text-xs font-medium text-stone-600">
              <StarIcon class="w-3.5 h-3.5 text-amber-500" />
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

      <p v-if="store.error" class="text-sm text-red-600 mt-4">{{ t('recommendation.genericError') }}</p>

      <div class="mt-10 pt-5 border-t border-stone-200 flex items-start gap-2 text-xs text-stone-400 max-w-xl">
        <SparklesIcon class="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
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

// The first book in the filtered set is spotlighted above the grid;
// the rest render in the regular grid below it.
const featuredBook = computed(() => filteredBooks.value[0] ?? null)
const restBooks = computed(() => filteredBooks.value.slice(1))

const featuredCoverUrl = computed(() => {
  const book = featuredBook.value
  if (!book?.cover_image || featuredCoverFailed.value) return null
  if (/^https?:\/\//i.test(book.cover_image)) return book.cover_image
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${book.cover_image}`
})

// The backend's `reason_label` is English-only, so the banner is translated
// from the `reason` code via recommendation.reasonLabels.*. Falls back to
// the raw backend label if an unrecognized code ever comes through.
const reasonLabel = computed(() => {
  if (!store.reason) return store.reasonLabel
  const key = `recommendation.reasonLabels.${store.reason}`
  return te(key) ? t(key) : store.reasonLabel
})

onMounted(() => store.fetchRecommendations())
</script>