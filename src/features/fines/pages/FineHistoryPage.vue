<template>
  <div class="space-y-6 pb-12">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          📜
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('fines.historyPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('fines.historyPage.subtitle') }}</p>
        </div>
      </div>
      <router-link 
        to="/fines" 
        class="border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center gap-1.5 flex-shrink-0"
      >
        <span>←</span> {{ t('fines.historyPage.backToFines') }}
      </router-link>
    </div>

    <!-- Main Table Container -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg space-y-6">
      <FineTable :fines="historyFines" :loading="store.loading" @view="goDetail" />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFineStore } from '../store/fineStore'
import FineTable from '../components/FineTable.vue'

const { t } = useI18n()
const router = useRouter()
const store = useFineStore()

const historyFines = computed(() => store.fines.filter((f) => f.status !== 'unpaid'))

function goDetail(fine) { router.push({ name: 'fine-detail', params: { id: fine.id } }) }

onMounted(() => store.fetchFines())
</script>