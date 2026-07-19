<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-gray-800">Add New Fine</h1>
      <router-link to="/fines" class="text-sm text-gray-500 hover:underline">← Back</router-link>
    </div>
    <div class="bg-white rounded-2xl border border-gray-200 p-6 max-w-lg">
      <FineForm :loading="store.loading" :errors="store.errors" @submit="handleSubmit" @cancel="router.push({ name: 'fine-list' })" />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useFineStore } from '../store/fineStore'
import FineForm from '../components/FineForm.vue'

const router = useRouter()
const store = useFineStore()

async function handleSubmit(payload) {
  const result = await store.createFine(payload)
  if (result.success) router.push({ name: 'fine-list' })
}
</script>