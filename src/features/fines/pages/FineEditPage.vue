<template>
  <div v-if="store.currentFine" class="space-y-6 pb-12 max-w-2xl">
    <!-- Header Banner -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
          ✏️
        </div>
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('fines.editPage.title') }}</h1>
          <p class="text-xs font-bold text-slate-500 mt-0.5">{{ t('fines.editPage.subtitle') }}</p>
        </div>
      </div>
      <router-link 
        to="/fines" 
        class="border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-colors shadow-2xs inline-flex items-center gap-1.5 flex-shrink-0"
      >
        <span>←</span> {{ t('fines.createPage.back') }}
      </router-link>
    </div>

    <!-- Form Container -->
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg space-y-6">
      <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
        <span class="text-amber-600 text-base font-black">⚠️</span>
        <p class="text-xs font-bold text-amber-800 leading-relaxed">
          {{ t('fines.editPage.onlyUnpaidHint') }}
        </p>
      </div>

      <!-- FIX: was previously missing entirely — the form rendered with
           no way to submit changes. Also, :initial-data is now an actual
           prop on FineForm.vue (it silently did nothing before), so the
           form correctly pre-fills from the loaded fine. -->
      <FineForm 
        :initial-data="store.currentFine" 
        :loading="store.loading" 
        :errors="store.errors" 
        @submit="handleSubmit"
        @cancel="router.back()" 
      />
    </div>
  </div>
  <div v-else class="text-center py-16 text-slate-400 font-bold text-xs uppercase tracking-widest">{{ t('fines.editPage.loading') }}</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useFineStore } from '../store/fineStore'
import FineForm from '../components/FineForm.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useFineStore()

onMounted(() => store.fetchFine(route.params.id))

async function handleSubmit(payload) {
  const result = await store.updateFine(route.params.id, payload)
  if (result.success) {
    router.push({ name: 'fine-list' })
  }
}
</script>