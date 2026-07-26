<template>
  <div v-if="store.currentFine" class="space-y-6 pb-12 max-w-2xl">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          📄
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Fine Detail</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Comprehensive information regarding this fine record</p>
        </div>
      </div>
      <router-link 
        to="/fines" 
        class="border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center gap-1.5 flex-shrink-0"
      >
        <span>←</span> Back
      </router-link>
    </div>

    <!-- Details Card Container -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-5">
      <div class="flex justify-between items-center py-2.5 border-b border-slate-100">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Member</span>
        <span class="text-xs font-extrabold text-slate-900">{{ store.currentFine.borrow?.member?.user?.name }}</span>
      </div>

      <div class="flex justify-between items-center py-2.5 border-b border-slate-100">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Book</span>
        <span class="text-xs font-extrabold text-slate-900">{{ store.currentFine.borrow?.book_copy?.book?.title }}</span>
      </div>

      <div class="flex justify-between items-center py-2.5 border-b border-slate-100">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Amount</span>
        <span class="text-sm font-black text-slate-900">${{ Number(store.currentFine.amount).toFixed(2) }}</span>
      </div>

      <div class="flex justify-between items-center py-2.5 border-b border-slate-100">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Reason</span>
        <span class="text-xs font-extrabold text-slate-700 capitalize">{{ store.currentFine.reason }}</span>
      </div>

      <div class="flex justify-between items-center py-2.5 border-b border-slate-100">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Status</span>
        <FineStatusBadge :status="store.currentFine.status" />
      </div>

      <div v-if="store.currentFine.paid_at" class="flex justify-between items-center py-2.5 border-b border-slate-100">
        <span class="text-xs font-black uppercase tracking-widest text-slate-400">Paid At</span>
        <span class="text-xs font-extrabold text-slate-700">{{ formatDate(store.currentFine.paid_at) }}</span>
      </div>

      <div v-if="store.currentFine.notes" class="pt-3 space-y-1.5">
        <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Notes</p>
        <div class="bg-slate-50 border-2 border-slate-200 rounded-xl p-3.5 text-xs font-bold text-slate-700 shadow-2xs">
          {{ store.currentFine.notes }}
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-16 text-slate-400 font-bold text-xs uppercase tracking-widest">Loading fine details...</div>
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