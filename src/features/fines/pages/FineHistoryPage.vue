<template>
  <div>
    <h1 class="text-xl font-bold text-gray-800 mb-5">Fine History</h1>
    <FineTable :fines="historyFines" :loading="store.loading" @view="goDetail" />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFineStore } from '../store/fineStore'
import FineTable from '../components/FineTable.vue'

const router = useRouter()
const store = useFineStore()

const historyFines = computed(() => store.fines.filter((f) => f.status !== 'unpaid'))

function goDetail(fine) { router.push({ name: 'fine-detail', params: { id: fine.id } }) }

onMounted(() => store.fetchFines())
</script>