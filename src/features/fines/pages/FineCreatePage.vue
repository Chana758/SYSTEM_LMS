<template>
  <div class="space-y-6 pb-12 max-w-2xl">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          ➕
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Add New Fine</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Create and issue a new fine record for a member</p>
        </div>
      </div>
      <router-link 
        to="/fines" 
        class="border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center gap-1.5 flex-shrink-0"
      >
        <span>←</span> Back
      </router-link>
    </div>

    <!-- Form Container -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg">
      <FineForm 
        :loading="store.loading" 
        :errors="store.errors" 
        @submit="handleSubmit" 
        @cancel="router.push({ name: 'fine-list' })" 
      />
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