<template>
  <div v-if="store.currentReservation">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <router-link to="/reservations" class="text-gray-400 hover:text-gray-600 text-sm">← Reservations</router-link>
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">Reservation Details</h1>
      </div>
      <ReservationStatusBadge :status="store.currentReservation.status" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 relative overflow-hidden">
        <span class="absolute left-0 top-0 bottom-0 w-1.5" :class="spineClass(store.currentReservation.status)"></span>

        <div class="flex gap-5">
          <div class="w-24 h-36 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
            <img v-if="store.currentReservation.book?.cover_image" :src="coverUrl(store.currentReservation.book.cover_image)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-3xl text-gray-300">📖</div>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ store.currentReservation.book?.title }}</h2>
            <p class="text-sm text-gray-500">{{ store.currentReservation.book?.author }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ store.currentReservation.book?.category?.name }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-5 mt-6 pt-6 border-t border-gray-100 text-sm">
          <div>
            <p class="text-gray-400 text-[11px] uppercase tracking-wide mb-1">Member</p>
            <p class="text-gray-800 font-medium">{{ store.currentReservation.member?.user?.name }}</p>
            <p class="text-xs text-gray-400">{{ store.currentReservation.member?.membership_no }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-[11px] uppercase tracking-wide mb-1">Queue Priority</p>
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-gray-700 font-bold text-xs">
              {{ store.currentReservation.priority_order }}
            </span>
          </div>
          <div>
            <p class="text-gray-400 text-[11px] uppercase tracking-wide mb-1">Reserved Date</p>
            <p class="text-gray-800">{{ formatDate(store.currentReservation.reserved_date) }}</p>
          </div>
          <div>
            <p class="text-gray-400 text-[11px] uppercase tracking-wide mb-1">Expires On</p>
            <p class="text-gray-800">{{ formatDate(store.currentReservation.expire_date) }}</p>
          </div>
        </div>
      </div>

      <div v-if="canManage" class="bg-white rounded-2xl border border-gray-200 p-6 h-fit space-y-3">
        <h3 class="font-bold text-gray-900 mb-2">Actions</h3>
        <button
          v-if="store.currentReservation.status === 'ready'"
          @click="handleFulfill"
          :disabled="actionLoading"
          class="w-full bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors shadow-sm"
        >
          Mark as Fulfilled
        </button>
        <button
          v-if="['pending', 'ready'].includes(store.currentReservation.status)"
          @click="handleCancel"
          :disabled="actionLoading"
          class="w-full border border-red-200 text-red-500 hover:bg-red-50 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          Cancel Reservation
        </button>
        <p v-if="actionMessage" class="text-sm" :class="actionSuccess ? 'text-emerald-600' : 'text-red-500'">{{ actionMessage }}</p>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-gray-400 text-sm">Loading…</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useReservationStore } from '../store/reservationStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import ReservationStatusBadge from '../components/ReservationStatusBadge.vue'

const route = useRoute()
const store = useReservationStore()
const authStore = useAuthStore()

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))
const actionLoading = ref(false)
const actionMessage = ref('')
const actionSuccess = ref(false)

function spineClass(status) {
  return {
    pending: 'bg-amber-400',
    ready: 'bg-blue-500',
    fulfilled: 'bg-emerald-500',
    cancelled: 'bg-gray-300',
    expired: 'bg-rose-400',
  }[status] || 'bg-gray-300'
}

async function handleFulfill() {
  actionLoading.value = true
  const result = await store.fulfillReservation(route.params.id)
  actionSuccess.value = result.success
  actionMessage.value = result.message
  actionLoading.value = false
}

async function handleCancel() {
  if (!confirm('Cancel this reservation?')) return
  actionLoading.value = true
  const result = await store.cancelReservation(route.params.id)
  actionSuccess.value = result.success
  actionMessage.value = result.message
  actionLoading.value = false
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function coverUrl(path) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${path}`
}

onMounted(() => store.fetchReservation(route.params.id))
</script>