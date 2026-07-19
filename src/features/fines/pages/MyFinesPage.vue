<template>
  <div>
    <div class="mb-5">
      <h1 class="text-xl font-bold text-gray-800">My Fines</h1>
      <p class="text-sm text-gray-400 mt-0.5">Overview of your library fines and payment history</p>
    </div>

    <!-- Balance Card -->
    <div class="bg-gradient-to-br from-green-700 to-green-800 rounded-2xl p-6 text-white mb-6">
      <p class="text-white/70 text-sm">Total Outstanding Balance</p>
      <p class="text-4xl font-bold mt-1">${{ store.myTotalUnpaid.toFixed(2) }}</p>
      <p class="text-white/60 text-xs mt-2" v-if="store.myTotalUnpaid > 0">
        Please settle at the library front desk to continue borrowing.
      </p>
      <p class="text-white/60 text-xs mt-2" v-else>You have no outstanding fines. 🎉</p>
    </div>

    <!-- List -->
    <div class="space-y-3">
      <p v-if="store.loading" class="text-center text-gray-400 py-8">Loading...</p>
      <p v-else-if="!store.myFines.length" class="text-center text-gray-400 py-8">You have no fine records.</p>

      <div v-for="fine in store.myFines" :key="fine.id" class="bg-white rounded-2xl border border-gray-200 p-4">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="fine.status === 'unpaid' ? 'bg-red-50' : 'bg-gray-100'">
              <BookOpenIcon class="w-5 h-5" :class="fine.status === 'unpaid' ? 'text-red-500' : 'text-gray-400'" />
            </div>
            <div>
              <p class="font-semibold text-gray-800">{{ fine.borrow?.book_copy?.book?.title || 'Unknown Book' }}</p>
              <p class="text-xs text-gray-400 capitalize">Reason: {{ fine.reason }}</p>
            </div>
          </div>
          <FineStatusBadge :status="fine.status" />
        </div>

        <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
          <span class="text-xs text-gray-400">{{ formatDate(fine.created_at) }}</span>
          <span class="text-lg font-bold" :class="fine.status === 'unpaid' ? 'text-red-600' : 'text-gray-800'">
            ${{ Number(fine.amount).toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { useFineStore } from '../store/fineStore'
import FineStatusBadge from '../components/FineStatusBadge.vue'

const store = useFineStore()

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB') : '—'
}

onMounted(() => store.fetchMyFines())
</script>