<template>
  <div v-if="store.currentFine">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-xl font-bold text-gray-800">Fine Detail</h1>
      <router-link to="/fines" class="text-sm text-gray-500 hover:underline">← Back</router-link>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6 space-y-3 max-w-xl">
      <div class="flex justify-between"><span class="text-gray-500">Member</span><span>{{ store.currentFine.borrow?.member?.user?.name }}</span></div>
      <div class="flex justify-between"><span class="text-gray-500">Book</span><span>{{ store.currentFine.borrow?.book_copy?.book?.title }}</span></div>
      <div class="flex justify-between"><span class="text-gray-500">Amount</span><span class="font-bold">${{ Number(store.currentFine.amount).toFixed(2) }}</span></div>
      <div class="flex justify-between"><span class="text-gray-500">Reason</span><span class="capitalize">{{ store.currentFine.reason }}</span></div>
      <div class="flex justify-between"><span class="text-gray-500">Status</span><FineStatusBadge :status="store.currentFine.status" /></div>
      <div v-if="store.currentFine.paid_at" class="flex justify-between"><span class="text-gray-500">Paid At</span><span>{{ formatDate(store.currentFine.paid_at) }}</span></div>
      <div v-if="store.currentFine.notes" class="pt-2 border-t"><p class="text-gray-500 text-sm mb-1">Notes</p><p>{{ store.currentFine.notes }}</p></div>
    </div>
  </div>
  <div v-else class="text-center py-10 text-gray-400">Loading...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFineStore } from '../store/fineStore'
import FineStatusBadge from '../components/FineStatusBadge.vue'

const route = useRoute()
const store = useFineStore()

function formatDate(d) { return new Date(d).toLocaleString('en-GB') }

onMounted(() => store.fetchFine(route.params.id))
</script>