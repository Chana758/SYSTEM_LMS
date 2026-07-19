<template>
  <div>
    <div class="flex items-center justify-between mb-5">
      <div>
        <h1 class="text-xl font-bold text-gray-800">Fines Management</h1>
        <p class="text-sm text-gray-400 mt-0.5">Track, collect, and manage member fines</p>
      </div>
      <div class="flex gap-2">
        <router-link to="/fines/report" class="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium">
          View Report
        </router-link>
        <router-link to="/fines/create" class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Fine
        </router-link>
      </div>
    </div>

    <FineSummaryCard :summary="store.summary" class="mb-6" />
    <FineFilter v-model="store.filters" @change="store.fetchFines(1)" />
    <FineTable :fines="store.fines" :loading="store.loading" @pay="openPay" @waive="openWaive" @view="goDetail" />

    <div class="flex justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
      <button v-for="p in store.pagination.last_page" :key="p" @click="store.fetchFines(p)"
        class="w-8 h-8 rounded-lg text-sm transition" :class="p === store.pagination.current_page ? 'bg-green-700 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'">
        {{ p }}
      </button>
    </div>

    <!-- Pay Modal -->
    <Teleport to="body">
      <div v-if="payTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
          <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <BanknotesIcon class="w-6 h-6 text-green-700" />
          </div>
          <h2 class="text-lg font-bold text-gray-800">Confirm Payment</h2>
          <p class="text-sm text-gray-500 mb-4">Amount due: <span class="font-bold text-gray-800">${{ Number(payTarget.amount).toFixed(2) }}</span></p>
          <label class="block text-xs font-medium text-gray-500 mb-1">Payment Method</label>
          <select v-model="paymentMethod" class="w-full border rounded-lg px-3 py-2 mb-4">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="other">Other</option>
          </select>
          <div class="flex justify-end gap-2">
            <button @click="payTarget = null" class="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
            <button @click="confirmPay" :disabled="paymentStore.processing" class="px-4 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50">
              {{ paymentStore.processing ? 'Processing...' : 'Confirm Payment' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Waive Modal -->
    <Teleport to="body">
      <div v-if="waiveTarget" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-sm">
          <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
            <HandRaisedIcon class="w-6 h-6 text-amber-600" />
          </div>
          <h2 class="text-lg font-bold text-gray-800">Waive Fine</h2>
          <p class="text-sm text-gray-500 mb-4">Amount: <span class="font-bold text-gray-800">${{ Number(waiveTarget.amount).toFixed(2) }}</span></p>
          <textarea v-model="waiveNotes" rows="3" placeholder="Reason for waiving (optional)" class="w-full border rounded-lg px-3 py-2 mb-4"></textarea>
          <div class="flex justify-end gap-2">
            <button @click="waiveTarget = null" class="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
            <button @click="confirmWaive" :disabled="paymentStore.processing" class="px-4 py-2 bg-amber-600 text-white rounded-lg disabled:opacity-50">
              {{ paymentStore.processing ? 'Processing...' : 'Confirm Waive' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BanknotesIcon, HandRaisedIcon } from '@heroicons/vue/24/outline'
import { useFineStore } from '../store/fineStore'
import { useFinePaymentStore } from '../store/finePaymentStore'
import FineSummaryCard from '../components/FineSummaryCard.vue'
import FineFilter from '../components/FineFilter.vue'
import FineTable from '../components/FineTable.vue'

const router = useRouter()
const store = useFineStore()
const paymentStore = useFinePaymentStore()

const payTarget = ref(null)
const waiveTarget = ref(null)
const paymentMethod = ref('cash')
const waiveNotes = ref('')

function openPay(fine) { payTarget.value = fine; paymentMethod.value = 'cash' }
function openWaive(fine) { waiveTarget.value = fine; waiveNotes.value = '' }
function goDetail(fine) { router.push({ name: 'fine-detail', params: { id: fine.id } }) }

async function confirmPay() {
  const result = await paymentStore.payFine(payTarget.value.id, paymentMethod.value)
  if (result.success) { payTarget.value = null; store.fetchFines(store.pagination.current_page); store.fetchSummary() }
}

async function confirmWaive() {
  const result = await paymentStore.waiveFine(waiveTarget.value.id, waiveNotes.value)
  if (result.success) { waiveTarget.value = null; store.fetchFines(store.pagination.current_page); store.fetchSummary() }
}

onMounted(() => {
  store.fetchFines()
  store.fetchSummary()
})
</script>