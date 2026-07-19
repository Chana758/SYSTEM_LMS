<template>
  <div v-if="store.currentLibrarian">
    <div class="flex items-center justify-between mb-6">
      <button @click="router.back()" class="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
        <ArrowLeftIcon class="w-4 h-4" /> Back to Librarians
      </button>
    </div>

    <div class="space-y-6">
      <LibrarianCard :librarian="store.currentLibrarian" />

      <div class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-base font-bold text-gray-800 mb-5">Edit Librarian Details</h2>
        <LibrarianForm
          :initial-data="store.currentLibrarian"
          :is-edit="true"
          :loading="store.loading"
          :errors="store.errors"
          @submit="handleUpdate"
          @cancel="router.back()"
        />
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-gray-400 text-sm">Loading...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useStaffStore } from '../store/staffStore'
import LibrarianForm from '../components/LibrarianForm.vue'
import LibrarianCard from '../components/LibrarianCard.vue'

const route = useRoute()
const router = useRouter()
const store = useStaffStore()

async function handleUpdate(formData) {
  // FIX: route name is 'staff-list' → WRONG, corrected to match
  // LibrarianListPage.vue's actual router.push({ name: 'staff-detail', ... })
  // pattern. The list page itself has no explicit route name shown yet,
  // so this uses router.back() instead to avoid guessing a name that
  // might not exist — safer than risking another "no matching route" bug.
  const success = await store.update(route.params.id, formData)
  if (success) router.back()
}

onMounted(() => store.fetchOne(route.params.id))
</script>