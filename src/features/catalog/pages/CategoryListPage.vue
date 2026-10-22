<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!--  HEADER SECTION  -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-5 sm:space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3 min-w-0">
          <router-link to="/books" class="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white transition-all">
            ←
          </router-link>
          <div class="min-w-0">
            <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('catalog.categoryPage.title') }}</h1>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('catalog.categoryPage.subtitle') }}</p>
          </div>
        </div>
        <button
          v-if="canManage"
          @click="openCreate"
          class="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 text-white px-5 py-3 md:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <span class="text-base leading-none">+</span>
          <span>{{ t('catalog.categoryPage.addCategory') }}</span>
        </button>
      </div>

      <!-- 2 per row on phones -->
      <div class="grid grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
        <div class="bg-blue-600 dark:bg-gradient-to-br dark:from-blue-600 dark:to-blue-900 border border-transparent dark:border-blue-300/20 text-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col justify-between transition-all hover:shadow-lg">
          <div class="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white/20 dark:ring-1 dark:ring-white/25 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
              <RectangleStackIcon class="w-5 h-5 sm:w-6 sm:h-6"/>
            </div>
            <span class="hidden sm:inline text-[10px] font-extrabold text-blue-100 uppercase tracking-widest bg-blue-700/60 dark:bg-blue-950/40 px-3 py-1 rounded-full">{{ t('catalog.categoryPage.totalGenres') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-2">{{ store.categories.length }}</p>
            <p class="text-[11px] sm:text-xs font-bold text-blue-100 tracking-wide">{{ t('catalog.categoryPage.activeCategories') }}</p>
          </div>
        </div>

        <div class="bg-emerald-600 dark:bg-gradient-to-br dark:from-emerald-600 dark:to-emerald-900 border border-transparent dark:border-emerald-300/20 text-white rounded-2xl shadow-md p-4 sm:p-6 flex flex-col justify-between transition-all hover:shadow-lg">
          <div class="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-white/20 dark:ring-1 dark:ring-white/25 backdrop-blur-xs flex items-center justify-center text-white flex-shrink-0">
              <BookOpenIcon class="w-5 h-5 sm:w-6 sm:h-6"/>
            </div>
            <span class="hidden sm:inline text-[10px] font-extrabold text-emerald-100 uppercase tracking-widest bg-emerald-700/60 dark:bg-emerald-950/40 px-3 py-1 rounded-full">{{ t('catalog.categoryPage.cataloged') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-2">{{ totalBooksCount }}</p>
            <p class="text-[11px] sm:text-xs font-bold text-emerald-100 tracking-wide">{{ t('catalog.categoryPage.totalBooksAcross') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- LOADING / EMPTY -->
    <div
      v-if="store.loading"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs text-center py-16 text-slate-400"
    >
      <div class="w-7 h-7 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('catalog.categoryPage.loadingCategories') }}</p>
    </div>

    <div
      v-else-if="!store.categories.length"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-2xs text-center py-16 text-slate-400"
    >
      <span class="text-3xl mb-2 block">📂</span>
      <p class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">{{ t('catalog.categoryPage.noCategories') }}</p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{{ t('catalog.categoryPage.noCategoriesHint') }}</p>
    </div>

    <template v-else>
      <!-- TABLE (md and up) -->
      <div class="hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 overflow-hidden shadow-2xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/70 dark:bg-white/5 border-b border-slate-200/80 dark:border-white/10 text-slate-400 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th class="px-5 py-3.5">{{ t('catalog.categoryPage.colName') }}</th>
                <th class="px-5 py-3.5">{{ t('catalog.categoryPage.colDescription') }}</th>
                <th class="px-5 py-3.5">{{ t('catalog.categoryPage.colBooksCount') }}</th>
                <th v-if="canManage" class="px-5 py-3.5 text-right">{{ t('catalog.categoryPage.colActions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-white/10 text-xs font-medium text-slate-700 dark:text-slate-300">
              <tr v-for="c in store.categories" :key="c.id" class="hover:bg-slate-50/60 dark:hover:bg-white/5 transition-colors">
                <td class="px-5 py-4 font-bold text-slate-900 dark:text-white">{{ c.name }}</td>
                <td class="px-5 py-4 text-slate-500 dark:text-slate-400 max-w-md truncate" :title="c.description">{{ c.description || '—' }}</td>
                <td class="px-5 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                    {{ c.books_count ?? 0 }}
                  </span>
                </td>
                <td v-if="canManage" class="px-5 py-4 text-right space-x-3">
                  <button @click="openEdit(c)" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">{{ t('catalog.common.edit') }}</button>
                  <button @click="handleDelete(c)" class="text-rose-500 dark:text-rose-400 font-bold hover:underline cursor-pointer">{{ t('catalog.common.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- CARD LIST (phones): no sideways scrolling -->
      <div class="md:hidden space-y-3">
        <div
          v-for="c in store.categories"
          :key="c.id"
          class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 shadow-2xs"
        >
          <div class="flex items-start justify-between gap-3">
            <p class="text-sm font-bold text-slate-900 dark:text-white break-words min-w-0">{{ c.name }}</p>
            <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-black flex-shrink-0">
              {{ c.books_count ?? 0 }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{{ c.description || '—' }}</p>

          <div v-if="canManage" class="grid grid-cols-2 gap-2 mt-4">
            <button
              @click="openEdit(c)"
              class="h-10 inline-flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              {{ t('catalog.common.edit') }}
            </button>
            <button
              @click="handleDelete(c)"
              class="h-10 inline-flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200/60 dark:border-rose-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              {{ t('catalog.common.delete') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- MODAL: bottom sheet on phones, centered dialog on sm+ -->
    <div v-if="showModal && canManage" class="fixed inset-0 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div
        class="bg-white dark:bg-slate-800 w-full max-w-md max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain
               rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10
               p-5 sm:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] sm:pb-8"
      >
        <CategoryForm :model-value="editingCategory" :errors="formErrors" @submit="handleSubmit" @cancel="showModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RectangleStackIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import CategoryForm from '../components/CategoryForm.vue'

const { t } = useI18n()
const store = useCatalogStore()
const authStore = useAuthStore()
const showModal = ref(false)
const editingCategory = ref(null)
const formErrors = ref({})

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))

const totalBooksCount = computed(() => {
  return store.categories.reduce((acc, cat) => acc + (Number(cat.books_count) || 0), 0)
})

function openCreate() {
  if (!canManage.value) return
  editingCategory.value = null
  formErrors.value = {}
  showModal.value = true
}

function openEdit(category) {
  if (!canManage.value) return
  editingCategory.value = category
  formErrors.value = {}
  showModal.value = true
}

async function handleSubmit(payload) {
  if (!canManage.value) return
  const result = editingCategory.value
    ? await store.updateCategory(editingCategory.value.id, payload)
    : await store.createCategory(payload)

  if (result.success) {
    showModal.value = false
    store.fetchCategories()
  } else {
    formErrors.value = result.errors || {}
  }
}

async function handleDelete(category) {
  if (!canManage.value) return
  if (!confirm(t('catalog.categoryPage.confirmDelete', { name: category.name }))) return
  const result = await store.deleteCategory(category.id)
  if (!result.success) alert(result.message)
}

onMounted(() => store.fetchCategories())
</script>