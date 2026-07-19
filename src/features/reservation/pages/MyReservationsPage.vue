<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">My Reservations</h1>
        <p class="text-sm text-gray-400 mt-0.5">Track your place in line and pick up books when they're ready.</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="inline-flex items-center gap-1.5 bg-green-700 hover:bg-green-800 text-white px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-colors"
      >
        + Reserve a Book
      </button>
    </div>

    <div v-if="store.loading" class="text-center py-16 text-gray-400 text-sm">Loading your reservations…</div>

    <!-- Empty state -->
    <div v-else-if="!store.myReservations.length">
      <!-- How it works — shown first, guides new members before the empty message -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <span class="text-sm font-bold text-amber-600">1</span>
          </div>
          <p class="text-sm font-semibold text-gray-800 mb-1">Reserve a checked-out book</p>
          <p class="text-xs text-gray-400 leading-relaxed">Find a title that's currently unavailable and join the queue.</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
            <span class="text-sm font-bold text-blue-600">2</span>
          </div>
          <p class="text-sm font-semibold text-gray-800 mb-1">We hold your place in line</p>
          <p class="text-xs text-gray-400 leading-relaxed">You'll see your queue position update as copies are returned.</p>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center mb-3">
            <span class="text-sm font-bold text-green-700">3</span>
          </div>
          <p class="text-sm font-semibold text-gray-800 mb-1">Pick it up when it's ready</p>
          <p class="text-xs text-gray-400 leading-relaxed">We'll notify you the moment your reserved copy is available.</p>
        </div>
      </div>

      <div class="flex flex-col items-center justify-center py-16 px-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
        <div class="relative w-16 h-16 mb-4">
          <div class="absolute inset-0 rounded-full bg-green-100/70"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <BookOpenIcon class="w-7 h-7 text-green-700" />
          </div>
        </div>
        <p class="text-gray-800 font-semibold">Your shelf is empty</p>
        <p class="text-sm text-gray-400 mt-1 mb-4 text-center max-w-xs">
          Reserve a book that's currently checked out and we'll hold your spot when it's back.
        </p>
        <button
          @click="showCreateModal = true"
          class="text-sm font-medium text-green-700 hover:text-green-800 hover:underline"
        >
          Browse and reserve a book →
        </button>
      </div>
    </div>

    <div v-else class="space-y-3">
      <ReservationCard
        v-for="r in store.myReservations" :key="r.id"
        :reservation="r"
        @cancel="handleCancel"
      />
    </div>

    <div class="flex justify-center gap-2 mt-8" v-if="store.myPagination.last_page > 1">
      <button
        v-for="p in store.myPagination.last_page" :key="p"
        @click="store.fetchMyReservations(p)"
        class="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
        :class="p === store.myPagination.current_page ? 'bg-green-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200'"
      >
        {{ p }}
      </button>
    </div>

    <ReservationCreateModal
      v-if="showCreateModal"
      @created="handleCreated"
      @cancel="showCreateModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { useReservationStore } from '../store/reservationStore'
import ReservationCard from '../components/ReservationCard.vue'
import ReservationCreateModal from '../components/ReservationCreateModal.vue'

const store = useReservationStore()
const showCreateModal = ref(false)

async function handleCancel(id) {
  if (!confirm('Cancel this reservation?')) return
  const result = await store.cancelReservation(id)
  if (!result.success) alert(result.message)
}

function handleCreated() {
  showCreateModal.value = false
  store.fetchMyReservations()
}

onMounted(() => store.fetchMyReservations())
</script>