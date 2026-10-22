<template>
  <div v-if="store.currentBook" class="space-y-4 sm:space-y-6 pb-12">
    <!--  HEADER SECTION  -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <button @click="router.back()" :class="ghostBtn + ' w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center flex-shrink-0'" aria-label="Back">
          ←
        </button>
        <div class="min-w-0">
          <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('catalog.detail.title') }}</h1>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('catalog.detail.subtitle') }}</p>
        </div>
      </div>
      <!-- The arrow already goes back on phones, so this button is only shown from sm up -->
      <button @click="router.back()" :class="ghostBtn + ' hidden sm:inline-flex text-xs font-bold px-4 py-2 whitespace-nowrap flex-shrink-0'">
        {{ t('catalog.detail.backToList') }}
      </button>
    </div>

    <!-- MAIN BOOK HERO CARD -->
    <div :class="card + ' flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5 sm:gap-6'">
      <div class="w-36 h-52 sm:w-32 sm:h-44 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700/40 flex-shrink-0 border border-slate-200/60 dark:border-white/10 shadow-inner">
        <img v-if="store.currentBook.cover_image" :src="coverUrl(store.currentBook.cover_image)" class="w-full h-full object-cover" />
        <div v-else class="w-full h-full flex items-center justify-center text-4xl text-slate-300 dark:text-slate-500">📖</div>
      </div>
      <div class="flex-1 min-w-0 space-y-3">
        <div>
          <span class="inline-block px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
            {{ store.currentBook.category?.name || 'General' }}
          </span>
          <h2 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight break-words leading-snug">{{ store.currentBook.title }}</h2>
          <p class="text-sm font-bold text-slate-500 dark:text-slate-400 mt-0.5">{{ store.currentBook.author }}</p>
        </div>

        <div class="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 pt-1">
          <div class="flex items-center gap-2">
            <StarRating :model-value="Math.round(store.currentBook.rating_avg || 0)" readonly show-count :count="store.currentBook.rating_count || 0" />
          </div>
          <span class="text-slate-300 dark:text-slate-600">•</span>
          <p class="text-xs font-semibold text-slate-400 dark:text-slate-400 flex items-center gap-1.5">
            <EyeIcon class="w-4 h-4 text-slate-400 dark:text-sky-400" />
            <span>{{ store.currentBook.views_count || 0 }} {{ t('catalog.detail.views') }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- ADMIN/LIBRARIAN: FULL EDITABLE FORM -->
    <div v-if="canManage" :class="card">
      <div class="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
        <div class="min-w-0">
          <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ t('catalog.detail.editInfo') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('catalog.detail.editInfoSubtitle') }}</p>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-black uppercase tracking-wider">
          {{ t('catalog.detail.adminMode') }}
        </span>
      </div>
      <BookForm
        :initial-data="store.currentBook"
        :is-edit="true"
        :loading="store.loading"
        :errors="store.errors"
        @submit="handleUpdate"
        @cancel="router.back()"
      />
    </div>

    <!-- MEMBER: READ-ONLY INFO BLOCK -->
    <div v-else :class="card">
      <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white mb-5 sm:mb-6 pb-4 border-b border-slate-100 dark:border-white/10">{{ t('catalog.detail.bookInformation') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 text-sm">
        <div :class="infoBox">
          <p :class="infoLabel">{{ t('catalog.detail.isbn') }}</p>
          <p class="text-slate-800 dark:text-slate-100 font-bold font-mono break-all">{{ store.currentBook.isbn || '—' }}</p>
        </div>
        <div :class="infoBox">
          <p :class="infoLabel">{{ t('catalog.detail.category') }}</p>
          <p class="text-slate-800 dark:text-slate-100 font-bold">{{ store.currentBook.category?.name || '—' }}</p>
        </div>
        <div :class="infoBox">
          <p :class="infoLabel">{{ t('catalog.detail.publisher') }}</p>
          <p class="text-slate-800 dark:text-slate-100 font-bold">{{ store.currentBook.publisher || '—' }}</p>
        </div>
        <div :class="infoBox">
          <p :class="infoLabel">{{ t('catalog.detail.publishYear') }}</p>
          <p class="text-slate-800 dark:text-slate-100 font-bold">{{ store.currentBook.publish_year || '—' }}</p>
        </div>
        <div :class="infoBox">
          <p :class="infoLabel">{{ t('catalog.detail.language') }}</p>
          <p class="text-slate-800 dark:text-slate-100 font-bold uppercase">{{ store.currentBook.language || '—' }}</p>
        </div>
        <div :class="infoBox">
          <p :class="infoLabel">{{ t('catalog.detail.shelfLocation') }}</p>
          <p class="text-slate-800 dark:text-slate-100 font-bold">{{ store.currentBook.shelf_location || '—' }}</p>
        </div>
        <div :class="infoBox + ' col-span-full'">
          <p :class="infoLabel">{{ t('catalog.detail.description') }}</p>
          <p class="text-slate-700 dark:text-slate-300 whitespace-pre-line text-xs leading-relaxed">{{ store.currentBook.description || t('catalog.detail.noDescription') }}</p>
        </div>
      </div>
    </div>

    <!-- ADD COPIES SECTION (ADMIN / LIBRARIAN) -->
    <div v-if="canManage" :class="card">
      <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white mb-1">{{ t('catalog.detail.addCopies') }}</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">{{ t('catalog.detail.addCopiesSubtitle') }}</p>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <input v-model.number="addQty" type="number" min="1" class="border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900/60 rounded-xl px-4 py-2.5 w-full sm:w-32 text-sm font-bold text-slate-800 dark:text-slate-100 focus:outline-emerald-600 dark:focus:outline-emerald-400 shadow-2xs" />
        <button @click="handleAddCopies" :disabled="store.loading" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-all shadow-sm cursor-pointer">
          {{ t('catalog.detail.addCopiesBtn') }}
        </button>
      </div>
      <p v-if="addCopiesMessage" class="text-xs font-bold mt-3" :class="addCopiesSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'">
        {{ addCopiesMessage }}
      </p>
    </div>

    <!-- PHYSICAL COPIES -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xs">
      <div class="p-4 sm:p-6 pb-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ t('catalog.detail.physicalCopies') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('catalog.detail.physicalCopiesSubtitle') }}</p>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-black whitespace-nowrap flex-shrink-0">
          {{ store.currentBook.book_copies?.length || 0 }} {{ t('catalog.detail.total') }}
        </span>
      </div>

      <!-- Phone: one card per copy -->
      <div class="md:hidden">
        <div v-if="!store.currentBook.book_copies?.length" class="text-center py-10 text-slate-400">
          <span class="text-2xl mb-1 block">🏷️</span>
          <p class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ t('catalog.detail.noCopies') }}</p>
        </div>
        <div v-else class="divide-y divide-slate-100 dark:divide-white/10">
          <div v-for="copy in store.currentBook.book_copies" :key="copy.id" class="p-4 space-y-3">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p :class="infoLabel">{{ t('catalog.detail.colBarcode') }}</p>
                <CopyBarcodeQr :barcode="copy.barcode" />
              </div>
              <span class="px-2.5 py-1 rounded-lg text-xs font-black inline-block flex-shrink-0" :class="copyStatusClass(copy.status)">
                {{ copy.status.charAt(0).toUpperCase() + copy.status.slice(1) }}
              </span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p :class="infoLabel">{{ t('catalog.detail.colCondition') }}</p>
                <p class="capitalize font-semibold text-slate-700 dark:text-slate-300">{{ copy.condition }}</p>
              </div>
              <div>
                <p :class="infoLabel">{{ t('catalog.detail.colLocation') }}</p>
                <p class="font-semibold text-slate-700 dark:text-slate-300">{{ copy.shelf_location || '—' }}</p>
              </div>
            </div>
            <button
              v-if="canManage"
              class="w-full py-2 rounded-xl border border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10 text-xs font-bold text-emerald-700 dark:text-emerald-300 cursor-pointer"
              @click="openManage(copy)"
            >
              {{ t('catalog.copy.manage') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tablet/desktop: table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <th class="px-6 py-3.5">{{ t('catalog.detail.colBarcode') }}</th>
              <th class="px-6 py-3.5">{{ t('catalog.detail.colStatus') }}</th>
              <th class="px-6 py-3.5">{{ t('catalog.detail.colCondition') }}</th>
              <th class="px-6 py-3.5">{{ t('catalog.detail.colLocation') }}</th>
              <th v-if="canManage" class="px-6 py-3.5 text-right">{{ t('catalog.table.actions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-white/10 text-xs font-medium text-slate-700 dark:text-slate-300">
            <tr v-if="!store.currentBook.book_copies?.length">
              <td colspan="5" class="text-center py-12 text-slate-400">
                <span class="text-2xl mb-1 block">🏷️</span>
                <p class="font-bold text-slate-700 dark:text-slate-200">{{ t('catalog.detail.noCopies') }}</p>
              </td>
            </tr>
            <tr v-for="copy in store.currentBook.book_copies" :key="copy.id" class="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
              <td class="px-6 py-4">
                <CopyBarcodeQr :barcode="copy.barcode" />
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 rounded-lg text-xs font-black inline-block" :class="copyStatusClass(copy.status)">
                  {{ copy.status.charAt(0).toUpperCase() + copy.status.slice(1) }}
                </span>
              </td>
              <td class="px-6 py-4 capitalize font-semibold text-slate-600 dark:text-slate-300">{{ copy.condition }}</td>
              <td class="px-6 py-4 font-semibold text-slate-600 dark:text-slate-300">{{ copy.shelf_location || '—' }}</td>
              <td v-if="canManage" class="px-6 py-4 text-right">
                <button class="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer" @click="openManage(copy)">
                  {{ t('catalog.copy.manage') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ REVIEWS SECTION ============ -->
    <div :class="card + ' space-y-5 sm:space-y-6'">
      <div class="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
        <div class="min-w-0">
          <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ t('catalog.detail.readerReviews') }}</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('catalog.detail.readerReviewsSubtitle') }}</p>
        </div>
        <span class="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-black whitespace-nowrap flex-shrink-0">
          {{ store.currentBook.rating_count || 0 }} {{ t('catalog.detail.reviews') }}
        </span>
      </div>

      <!-- Submit Review Box -->
      <div class="bg-slate-50/70 dark:bg-white/5 rounded-xl p-4 sm:p-5 border border-slate-200/70 dark:border-white/10 space-y-4">
        <p class="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">{{ t('catalog.detail.leaveReview') }}</p>
        <div>
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">{{ t('catalog.detail.yourRating') }}</span>
          <StarRating v-model="myRating" />
        </div>
        <div>
          <textarea v-model="myComment" rows="3" :placeholder="t('catalog.detail.reviewPlaceholder')" class="w-full border border-slate-300 dark:border-white/15 rounded-xl px-4 py-3 text-xs bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-emerald-600 dark:focus:outline-emerald-400 shadow-2xs"></textarea>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <button @click="handleSubmitReview" :disabled="!myRating" class="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition-all shadow-sm cursor-pointer">
            {{ t('catalog.detail.submitReview') }}
          </button>
          <p v-if="reviewMessage" class="text-xs font-bold" :class="reviewSuccess ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'">{{ reviewMessage }}</p>
        </div>
      </div>

      <!-- Reviews Feed -->
      <div class="space-y-3 sm:space-y-4 pt-2">
        <div v-if="!store.reviews.length" class="text-slate-400 text-xs text-center py-10 sm:py-12">
          <span class="text-2xl mb-1 block">💬</span>
          <p class="font-bold text-slate-700 dark:text-slate-200">{{ t('catalog.detail.noReviews') }}</p>
          <p class="text-slate-400 dark:text-slate-500 mt-0.5">{{ t('catalog.detail.beFirstReview') }}</p>
        </div>
        <div v-for="r in store.reviews" :key="r.id" class="p-4 rounded-xl border border-slate-100 dark:border-white/10 bg-slate-50/40 dark:bg-white/5 space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <span class="text-xs font-bold text-slate-900 dark:text-white break-words min-w-0">{{ r.member?.user?.name || 'Anonymous' }}</span>
            <StarRating :model-value="r.rating" readonly />
          </div>
          <p v-if="r.comment" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">{{ r.comment }}</p>
        </div>
      </div>
    </div>

    <!-- ============ COPY MANAGE MODAL ============ -->
    <CopyManageModal v-model="showManage" :copy="selectedCopy" @changed="store.fetchBook(route.params.id)" />
  </div>
  <div v-else class="text-center py-20 text-slate-400">
    <div class="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('catalog.detail.loadingDetail') }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { EyeIcon } from '@heroicons/vue/24/outline'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import { coverUrl } from '@/utils/coverUrl'
import BookForm from '../components/BookForm.vue'
import StarRating from '../components/StarRating.vue'
import CopyBarcodeQr from '../components/CopyBarcodeQr.vue'
import CopyManageModal from '../components/CopyManageModal.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useCatalogStore()
const authStore = useAuthStore()
const addQty = ref(1)
const addCopiesMessage = ref('')
const addCopiesSuccess = ref(false)
const myRating = ref(0)
const myComment = ref('')
const reviewMessage = ref('')
const reviewSuccess = ref(false)
const showManage = ref(false)
const selectedCopy = ref(null)

// ---- shared light/dark classes ----
const card = 'bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-2xs'
const ghostBtn = 'rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all shadow-2xs cursor-pointer'
const infoBox = 'bg-slate-50/60 dark:bg-white/5 p-3.5 sm:p-4 rounded-xl border border-slate-100 dark:border-white/10'
const infoLabel = 'text-slate-400 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1'

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))

function openManage(copy) {
  selectedCopy.value = copy
  showManage.value = true
}

async function handleUpdate(formData) {
  const result = await store.updateBook(route.params.id, formData)
  if (result.success) store.fetchBook(route.params.id)
}

async function handleAddCopies() {
  const result = await store.addCopies(route.params.id, addQty.value)
  addCopiesSuccess.value = result.success
  addCopiesMessage.value = result.message
  if (result.success) {
    store.fetchBook(route.params.id)
    addQty.value = 1
  }
}

async function handleSubmitReview() {
  const result = await store.submitReview(route.params.id, { rating: myRating.value, comment: myComment.value })
  reviewSuccess.value = result.success
  reviewMessage.value = result.message
  if (result.success) {
    store.fetchBook(route.params.id)
    myComment.value = ''
    myRating.value = 0
  }
}

function copyStatusClass(status) {
  return {
    available: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/20',
    borrowed: 'bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/20',
    lost: 'bg-rose-50 text-rose-600 border border-rose-200/50 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-400/20',
    damaged: 'bg-slate-100 text-slate-600 border border-slate-200/50 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-400/20',
    archived: 'bg-slate-200 text-slate-600 border border-slate-300/50 dark:bg-slate-600/30 dark:text-slate-300 dark:border-slate-400/20',
  }[status] || 'bg-slate-100 text-slate-600 border border-slate-200/50 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-400/20'
}

onMounted(() => {
  store.fetchCategories()
  store.fetchBook(route.params.id)
})
</script>