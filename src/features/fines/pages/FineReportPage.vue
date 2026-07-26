<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          📊
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Fine Report</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">Statistical overview and analytics of member fines</p>
        </div>
      </div>
      <router-link 
        to="/fines" 
        class="border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center gap-1.5 flex-shrink-0"
      >
        <span>←</span> Back to Fines
      </router-link>
    </div>

    <!-- Summary Cards -->
    <FineSummaryCard :summary="store.summary" />

    <!-- Coming Soon Box -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-8 shadow-lg text-center space-y-3">
      <div class="w-12 h-12 bg-slate-100 border-2 border-slate-200 rounded-xl flex items-center justify-center mx-auto text-xl shadow-2xs">
        📈
      </div>
      <div>
        <h3 class="text-sm font-black text-slate-900 uppercase tracking-wider">Advanced Analytics</h3>
        <p class="text-xs font-bold text-slate-500 mt-1">Detailed export functionality and report charts coming soon.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFineStore } from '../store/fineStore'
import FineSummaryCard from '../components/FineSummaryCard.vue'

const store = useFineStore()
onMounted(() => store.fetchSummary())
</script>