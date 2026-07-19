<template>
  <div v-if="store.currentFine">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-gray-800">Edit Fine</h1>
      <router-link to="/fines" class="text-sm text-gray-500 hover:underline">← Back</router-link>
    </div>
    <div class="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
      <p class="text-sm text-gray-500 mb-4">
        Only unpaid fines can be edited. Use Pay/Waive actions from the list page to finalize.
      </p>
      <FineForm :initial-data="store.currentFine" :loading="store.loading" :errors="store.errors" @cancel="router.back()" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFineStore } from '../store/fineStore'
import FineForm from '../components/FineForm.vue'

const route = useRoute()
const router = useRouter()
const store = useFineStore()

onMounted(() => store.fetchFine(route.params.id))
</script>