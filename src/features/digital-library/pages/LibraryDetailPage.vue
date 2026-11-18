<template>
  <div v-if="store.currentEbook" class="space-y-4 sm:space-y-6 pb-12">
    <!-- Back Link -->
    <div class="inline-block">
      <router-link
        :to="{ name: 'library-home-page' }"
        class="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
      >
        <span>←</span> {{ t('digitalLibrary.detail.backToLibrary') }}
      </router-link>
    </div>

    <!-- Main Container -->
    <div class="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-white/10 p-3 sm:p-6 md:p-8 shadow-lg dark:shadow-black/30 space-y-8 border-dashed transition-colors">

      <!-- Top Detail Card Section -->
      <div class="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border-2 border-slate-200 dark:border-white/10 p-4 sm:p-8 shadow-2xs flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">

        <!-- Book Cover Box -->
        <div class="w-40 sm:w-48 md:w-56 aspect-[3/4] rounded-xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 flex-shrink-0 shadow-sm relative">
          <img
            v-if="store.currentEbook.book?.cover_image"
            :src="coverUrl(store.currentEbook.book.cover_image)"
            class="w-full h-full object-cover"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-4xl text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800">📖</div>
        </div>

        <!-- Book Info & Meta -->
        <div class="flex-1 space-y-4 w-full min-w-0">
          <div class="text-center md:text-left">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-2 border-emerald-200 dark:border-emerald-400/25 mb-3 shadow-2xs">
              {{ store.currentEbook.book?.category?.name || '—' }}
            </span>
            <h1 class="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight break-words">{{ store.currentEbook.book?.title }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{{ t('digitalLibrary.detail.author') }}: <span class="text-slate-700 dark:text-slate-200">{{ store.currentEbook.book?.author }}</span></p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2">
            <div class="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-slate-200 dark:border-white/10 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('digitalLibrary.detail.format') }}</p>
              <p class="text-xs font-black text-slate-800 dark:text-white uppercase mt-0.5">{{ store.currentEbook.format }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-slate-200 dark:border-white/10 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('digitalLibrary.detail.access') }}</p>
              <p class="text-xs font-black text-slate-800 dark:text-white capitalize mt-0.5">{{ store.currentEbook.access_type === 'public' ? t('digitalLibrary.detail.accessPublic') : t('digitalLibrary.detail.accessMembersOnly') }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-slate-200 dark:border-white/10 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('digitalLibrary.detail.views') }}</p>
              <p class="text-xs font-black text-slate-800 dark:text-white mt-0.5">{{ store.currentEbook.view_count }}</p>
            </div>
            <div class="bg-white dark:bg-slate-900/60 rounded-xl border-2 border-slate-200 dark:border-white/10 p-3 shadow-2xs">
              <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{{ t('digitalLibrary.detail.downloads') }}</p>
              <p class="text-xs font-black text-slate-800 dark:text-white mt-0.5">{{ store.currentEbook.download_count }}</p>
            </div>
          </div>

          <!-- Reading Progress Banner -->
          <div v-if="store.currentEbook.reading_progress" class="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border-2 border-emerald-200 dark:border-emerald-400/25 px-4 py-3 text-xs font-black text-emerald-800 dark:text-emerald-200 shadow-2xs flex items-center gap-2">
            <span>✨</span>
            <span>{{ t('digitalLibrary.detail.readingProgress', { percent: Math.round(store.currentEbook.reading_progress.percentage) }) }}</span>
          </div>

          <!-- Description -->
          <div class="pt-2">
            <h3 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">{{ t('digitalLibrary.detail.description') }}</h3>
            <p v-if="store.currentEbook.book?.description" class="text-xs font-bold text-slate-600 dark:text-slate-300 leading-relaxed">
              {{ store.currentEbook.book.description }}
            </p>
            <p v-else class="text-xs font-bold text-slate-400 dark:text-slate-500 italic">{{ t('digitalLibrary.detail.noDescription') }}</p>
          </div>

          <!-- Action Buttons (all in one row; Edit/Delete only for admin / librarian) -->
          <div class="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-4 border-t border-slate-200/80 dark:border-white/10">
            <router-link
              :to="{ name: 'book-reader-page', params: { id: store.currentEbook.id } }"
              class="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-5 py-3 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <BookOpenIcon class="w-4 h-4" />
              {{ store.currentEbook.reading_progress ? t('digitalLibrary.detail.continueReading') : t('digitalLibrary.detail.readOnline') }}
            </router-link>
            <DownloadButton :ebook="store.currentEbook" class="w-full sm:w-auto" />
            <FavoriteButton :ebook-id="store.currentEbook.id" :initial-favorited="store.currentEbook.is_favorited" class="w-full sm:w-auto justify-center" />

            <template v-if="isStaff">
              <button
                type="button"
                @click="showEditModal = true"
                class="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-white/15 hover:border-slate-400 dark:hover:border-white/30 text-slate-700 dark:text-slate-200 px-5 py-3 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <PencilSquareIcon class="w-4 h-4" />
                {{ t('digitalLibrary.detail.edit') }}
              </button>
              <button
                type="button"
                @click="showDeleteConfirm = true"
                class="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 sm:py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <TrashIcon class="w-4 h-4" />
                {{ t('digitalLibrary.detail.delete') }}
              </button>
            </template>
          </div>

        </div>
      </div>

    </div>

    <!-- Edit modal (reuses EbookFormModal in edit mode) -->
    <EbookFormModal
      v-if="showEditModal"
      :ebook="store.currentEbook"
      @saved="handleSaved"
      @cancel="showEditModal = false"
    />

    <!-- Delete confirmation -->
    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 sm:p-4"
    >
      <div
        class="bg-white dark:bg-slate-900 border border-transparent dark:border-white/10 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-md shadow-xl dark:shadow-black/50"
        style="padding-bottom: max(1.25rem, env(safe-area-inset-bottom));"
      >
        <div class="w-12 h-12 bg-rose-50 dark:bg-rose-500/15 border-2 border-rose-200 dark:border-rose-400/25 rounded-xl flex items-center justify-center mb-3 text-rose-600 dark:text-rose-300">
          <TrashIcon class="w-6 h-6" />
        </div>
        <h2 class="text-lg font-bold text-gray-800 dark:text-white mb-1">{{ t('digitalLibrary.detail.deleteTitle') }}</h2>
        <p class="text-sm text-gray-500 dark:text-slate-400 mb-1">
          <span class="font-semibold text-gray-700 dark:text-slate-200">{{ store.currentEbook.book?.title }}</span>
        </p>
        <p class="text-sm text-gray-500 dark:text-slate-400 mb-4">{{ t('digitalLibrary.detail.confirmDelete') }}</p>

        <p v-if="deleteError" class="text-red-500 dark:text-rose-400 text-sm mb-3">{{ deleteError }}</p>

        <div class="flex gap-2">
          <button
            type="button"
            :disabled="deleting"
            @click="showDeleteConfirm = false"
            class="flex-1 border border-gray-300 dark:border-white/15 text-gray-600 dark:text-slate-300 py-3 sm:py-2.5 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            {{ t('digitalLibrary.formModal.cancel') }}
          </button>
          <button
            type="button"
            :disabled="deleting"
            @click="handleDelete"
            class="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 sm:py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors"
          >
            {{ deleting ? t('digitalLibrary.detail.deleting') : t('digitalLibrary.detail.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-24 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
    {{ t('digitalLibrary.detail.loading') }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { BookOpenIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useLibraryStore } from '../store/libraryStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import DownloadButton from '../components/DownloadButton.vue'
import FavoriteButton from '../components/FavoriteButton.vue'
import EbookFormModal from '../components/EbookFormModal.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useLibraryStore()
const authStore = useAuthStore()

const isStaff = computed(() => ['admin', 'librarian'].includes(authStore.role))

const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const deleting = ref(false)
const deleteError = ref('')

function coverUrl(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}

async function handleSaved() {
  showEditModal.value = false
  await store.fetchEbook(route.params.id)
}

async function handleDelete() {
  deleteError.value = ''
  deleting.value = true
  const result = await store.deleteEbook(store.currentEbook.id)
  deleting.value = false

  if (result.success) {
    showDeleteConfirm.value = false
    store.currentEbook = null
    router.push({ name: 'library-home-page' })
  } else {
    deleteError.value = result.message
  }
}

onMounted(() => store.fetchEbook(route.params.id))
</script>