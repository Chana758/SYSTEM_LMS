<template>
  <div class="min-h-full bg-gradient-to-br from-stone-50 via-stone-100/50 to-stone-50 p-6 lg:p-10">
    <div class="max-w-7xl mx-auto space-y-8">
      
      <!-- Modern Hero Section -->
      <div class="relative overflow-hidden bg-gradient-to-r from-green-900 via-green-800 to-emerald-900 rounded-3xl p-8 shadow-xl text-white">
        <div class="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner flex-shrink-0">
              <SparklesIcon class="w-7 h-7 text-amber-300" />
            </div>
            <div>
              <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight">{{ t('recommendation.title') }}</h1>
              <p class="text-green-100 text-sm mt-1 opacity-90">{{ t('recommendation.subtitle') }}</p>
            </div>
          </div>

          <!-- Quick Stats Badge Group -->
          <div class="flex items-center gap-3 bg-black/20 backdrop-blur-md p-2 rounded-2xl border border-white/10 self-start md:self-auto">
            <div class="px-4 py-2 text-center border-r border-white/10">
              <span class="block text-xs text-green-200 uppercase tracking-wider font-medium">{{ t('recommendation.sidebar.recommendedCount') }}</span>
              <span class="text-lg font-bold text-white">{{ store.books.length }}</span>
            </div>
            <div class="px-4 py-2 text-center">
              <span class="block text-xs text-green-200 uppercase tracking-wider font-medium">{{ t('recommendation.sidebar.categoriesShown') }}</span>
              <span class="text-lg font-bold text-white">{{ categories.length || t('recommendation.sidebar.allCategoriesLabel') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="space-y-6">
        <!-- Reason Label Alert Banner -->
        <div
          v-if="store.reasonLabel"
          class="flex items-center justify-between px-5 py-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">💡</div>
            <p class="text-xs lg:text-sm font-semibold text-amber-900">{{ getReasonLabel(store.reasonLabel) }}</p>
          </div>
        </div>

        <!-- Filter Component -->
        <RecommendationFilter v-if="categories.length" v-model="selectedCategory" :categories="categories" />

        <!-- Recommendation List Component -->
        <RecommendationList
          :books="filteredBooks"
          :loading="store.loading"
          @book-click="store.trackClick"
        />

        <p v-if="store.error" class="text-sm text-red-600 font-medium bg-red-50 p-4 rounded-xl border border-red-200">{{ t('recommendation.genericError') }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { SparklesIcon } from '@heroicons/vue/24/outline'
import { useRecommendationStore } from '../store/recommendationStore'
import RecommendationFilter from '../components/RecommendationFilter.vue'
import RecommendationList from '../components/RecommendationList.vue'

const { t } = useI18n()
const store = useRecommendationStore()
const selectedCategory = ref('')

const categories = computed(() =>
  [...new Set(store.books.map((b) => b.category?.name).filter(Boolean))]
)

const filteredBooks = computed(() =>
  selectedCategory.value
    ? store.books.filter((b) => b.category?.name === selectedCategory.value)
    : store.books
)

function getReasonLabel(reasonKey) {
  if (['content_based', 'popular', 'popular_no_member'].includes(reasonKey)) {
    return t(`recommendation.reasonLabels.${reasonKey}`)
  }
  return reasonKey
}

onMounted(() => store.fetchRecommendations())
</script>