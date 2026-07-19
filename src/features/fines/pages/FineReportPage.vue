<template>
  <div>
    <h1 class="text-xl font-bold text-gray-800 mb-5">Fine Report</h1>
    <FineSummaryCard :summary="store.summary" />
    <p class="text-sm text-gray-400 mt-6">Detailed export/report chart coming soon.</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useFineStore } from '../store/fineStore'
import FineSummaryCard from '../components/FineSummaryCard.vue'

const store = useFineStore()
onMounted(() => store.fetchSummary())
</script>