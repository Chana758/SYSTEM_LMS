<template>
  <div v-if="store.currentReservation" class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="flex items-center justify-between pb-6 border-b border-slate-200">
      <div class="flex items-center gap-4">
        <router-link
          to="/reservations"
          class="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors shadow-2xs shrink-0"
          :title="$t('reservation.createPage.back')"
        >
          ←
        </router-link>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('reservation.detailPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ $t('reservation.detailPage.subtitle') }}</p>
        </div>
      </div>
      <ReservationStatusBadge :status="store.currentReservation.status" />
    </div>

    <!-- Main Grid Content -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <!-- Details Card -->
      <div class="md:col-span-2 bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 relative overflow-hidden shadow-md">
        <!-- Spine Accent Bar -->
        <span class="absolute left-0 top-0 bottom-0 w-2" :class="spineClass(store.currentReservation.status)"></span>

        <!-- Book Info Section -->
        <div class="flex gap-5 items-start">
          <div class="w-24 h-36 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0 shadow-2xs">
            <img v-if="store.currentReservation.book?.cover_image" :src="coverUrl(store.currentReservation.book.cover_image)" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-3xl text-slate-400">📖</div>
          </div>
          <div class="space-y-1">
            <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ store.currentReservation.book?.title }}</h2>
            <p class="text-xs font-extrabold text-slate-600">{{ store.currentReservation.book?.author }}</p>
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{{ store.currentReservation.book?.category?.name }}</p>
          </div>
        </div>

        <!-- Meta Grid -->
        <div class="grid grid-cols-2 gap-5 mt-6 pt-6 border-t-2 border-slate-100 text-sm">
          <div class="bg-slate-50/70 border-2 border-slate-200 rounded-xl p-4 shadow-2xs">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{{ $t('reservation.member') }}</p>
            <p class="text-slate-900 font-extrabold">{{ store.currentReservation.member?.user?.name }}</p>
            <p class="text-xs font-bold text-slate-500 mt-0.5">{{ store.currentReservation.member?.membership_no }}</p>
          </div>

          <div class="bg-slate-50/70 border-2 border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{{ $t('reservation.detailPage.queuePriority') }}</p>
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white border-2 border-slate-300 text-slate-900 font-black text-xs shadow-2xs">
              {{ store.currentReservation.priority_order }}
            </span>
          </div>

          <div class="bg-slate-50/70 border-2 border-slate-200 rounded-xl p-4 shadow-2xs">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{{ $t('reservation.detailPage.reservedDate') }}</p>
            <p class="text-slate-900 font-extrabold text-xs mt-1">{{ formatDate(store.currentReservation.reserved_date) }}</p>
          </div>

          <div class="bg-slate-50/70 border-2 border-slate-200 rounded-xl p-4 shadow-2xs">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{{ $t('reservation.detailPage.expiresOn') }}</p>
            <p class="text-slate-900 font-extrabold text-xs mt-1">{{ formatDate(store.currentReservation.expire_date) }}</p>
          </div>
        </div>
      </div>

      <!-- Action Panel -->
      <div v-if="canManage" class="bg-white rounded-2xl border-2 border-slate-300 p-6 h-fit space-y-4 shadow-md">
        <h3 class="font-black text-slate-900 text-sm tracking-tight">{{ $t('reservation.detailPage.actionsTitle') }}</h3>
        
        <button
          v-if="store.currentReservation.status === 'ready'"
          @click="handleFulfill"
          :disabled="actionLoading"
          class="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-sm"
        >
          {{ $t('reservation.detailPage.markFulfilled') }}
        </button>

        <button
          v-if="['pending', 'ready'].includes(store.currentReservation.status)"
          @click="handleCancel"
          :disabled="actionLoading"
          class="w-full border-2 border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 py-2.5 rounded-xl text-xs font-extrabold disabled:opacity-50 transition-colors shadow-2xs"
        >
          {{ $t('reservation.detailPage.cancelReservation') }}
        </button>

        <p v-if="actionMessage" class="text-xs font-extrabold p-3 rounded-xl border-2" :class="actionSuccess ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-600 bg-rose-50 border-rose-200'">
          {{ actionMessage }}
        </p>
      </div>

    </div>
  </div>
  
  <!-- Loading State -->
  <div v-else class="bg-white rounded-2xl border-2 border-slate-300 p-16 text-center text-slate-400 text-sm font-semibold shadow-2xs">
    {{ $t('reservation.detailPage.loading') }}
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useReservationStore } from '../store/reservationStore'
import { useAuthStore } from '@/features/auth/store/authStore'
import ReservationStatusBadge from '../components/ReservationStatusBadge.vue'

const route = useRoute()
const store = useReservationStore()
const authStore = useAuthStore()
const { t } = useI18n()

const canManage = computed(() => ['admin', 'librarian'].includes(authStore.role))
const actionLoading = ref(false)
const actionMessage = ref('')
const actionSuccess = ref(false)

function spineClass(status) {
  return {
    pending: 'bg-amber-400',
    ready: 'bg-blue-500',
    fulfilled: 'bg-emerald-500',
    cancelled: 'bg-slate-300',
    expired: 'bg-rose-400',
  }[status] || 'bg-slate-300'
}

async function handleFulfill() {
  actionLoading.value = true
  const result = await store.fulfillReservation(route.params.id)
  actionSuccess.value = result.success
  actionMessage.value = result.message
  actionLoading.value = false
}

async function handleCancel() {
  if (!confirm(t('reservation.confirmCancel'))) return
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