<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-3">
        <router-link to="/books" class="text-gray-400 hover:text-gray-600 text-sm">← Books</router-link>
        <h1 class="text-xl font-bold text-gray-800">Category Management</h1>
      </div>
      <button v-if="canManage" @click="openCreate" class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
        + Add Category
      </button>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
          <tr>
            <th class="text-left px-4 py-3">Name</th>
            <th class="text-left px-4 py-3">Description</th>
            <th class="text-left px-4 py-3">Books Count</th>
            <th v-if="canManage" class="text-right px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.loading"><td :colspan="canManage ? 4 : 3" class="text-center py-6 text-gray-400">Loading...</td></tr>
          <tr v-else-if="!store.categories.length"><td :colspan="canManage ? 4 : 3" class="text-center py-6 text-gray-400">No categories yet</td></tr>
          <tr v-for="c in store.categories" :key="c.id" class="border-t border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 font-medium">{{ c.name }}</td>
            <td class="px-4 py-3 text-gray-500">{{ c.description || '—' }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                {{ c.books_count ?? 0 }}
              </span>
            </td>
            <td v-if="canManage" class="px-4 py-3 text-right space-x-3">
              <button @click="openEdit(c)" class="text-green-700 hover:underline">Edit</button>
              <button @click="handleDelete(c)" class="text-red-500 hover:underline">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal && canManage" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md">
        <CategoryForm :model-value="editingCategory" :errors="formErrors" @submit="handleSubmit" @cancel="showModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCatalogStore } from '../store/catalogStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import CategoryForm from '../components/CategoryForm.vue'

const store = useCatalogStore()
const authStore = useAuthStore()
const showModal = ref(false)
const editingCategory = ref(null)
const formErrors = ref({})

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))

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