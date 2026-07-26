<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION WITH MODERN DASHBOARD STAT CARDS ============ -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
      
      <!-- Top Title & Action Buttons -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex items-center gap-3">
          <router-link to="/books" class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-all">
            ←
          </router-link>
          <div>
            <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">Category Management</h1>
            <p class="text-xs font-semibold text-slate-500 mt-0.5">Organize library catalog genres, descriptions, and track book distribution.</p>
          </div>
        </div>
        <button
          v-if="canManage"
          @click="openCreate"
          class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
        >
          <span class="text-base leading-none">+</span>
          <span>Add Category</span>
        </button>
      </div>

      <!-- 2 Stat Cards (Clean Dashboard Metric Style) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <!-- Total Categories Card -->
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between transition-all hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <RectangleStackIcon class="w-5 h-5 text-emerald-700"/>
            </div>
            <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Genres</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ store.categories.length }}</p>
            <p class="text-[11px] font-bold text-emerald-600 tracking-wide">Active library categories</p>
          </div>
        </div>

        <!-- Total Books Cataloged Card -->
        <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between transition-all hover:shadow-md">
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpenIcon class="w-5 h-5 text-blue-600"/>
            </div>
            <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Cataloged</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ totalBooksCount }}</p>
            <p class="text-[11px] font-bold text-blue-600 tracking-wide">Total books across categories</p>
          </div>
        </div>
      </div>

    </div>

    <!-- ============ TABLE CONTAINER ============ -->
    <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <th class="px-5 py-3.5">Name</th>
              <th class="px-5 py-3.5">Description</th>
              <th class="px-5 py-3.5">Books Count</th>
              <th v-if="canManage" class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs font-medium text-slate-700">
            <tr v-if="store.loading">
              <td :colspan="canManage ? 4 : 3" class="text-center py-16 text-slate-400">
                <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading categories...</p>
              </td>
            </tr>
            <tr v-else-if="!store.categories.length">
              <td :colspan="canManage ? 4 : 3" class="text-center py-16 text-slate-400">
                <span class="text-3xl mb-2 block">📂</span>
                <p class="text-xs font-black uppercase tracking-wider text-slate-800">No categories yet</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Click "Add Category" above to create your first genre.</p>
              </td>
            </tr>
            <tr v-for="c in store.categories" :key="c.id" class="hover:bg-slate-50/60 transition-colors">
              <td class="px-5 py-4 font-bold text-slate-900">{{ c.name }}</td>
              <td class="px-5 py-4 text-slate-500 max-w-md truncate" :title="c.description">{{ c.description || '—' }}</td>
              <td class="px-5 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-black">
                  {{ c.books_count ?? 0 }}
                </span>
              </td>
              <td v-if="canManage" class="px-5 py-4 text-right space-x-3">
                <button @click="openEdit(c)" class="text-emerald-600 font-bold hover:underline cursor-pointer">Edit</button>
                <button @click="handleDelete(c)" class="text-rose-500 font-bold hover:underline cursor-pointer">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ MODAL ============ -->
    <div v-if="showModal && canManage" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200">
        <CategoryForm :model-value="editingCategory" :errors="formErrors" @submit="handleSubmit" @cancel="showModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RectangleStackIcon, BookOpenIcon } from '@heroicons/vue/24/outline'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import CategoryForm from '../components/CategoryForm.vue'

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
  if (!confirm(`Delete category "${category.name}"?`)) return
  const result = await store.deleteCategory(category.id)
  if (!result.success) alert(result.message)
}

onMounted(() => store.fetchCategories())
</script>