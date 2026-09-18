<template>
  <div class="space-y-6 pb-12">
    <!-- Main Wrapper Card -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-6">
      
      <!-- Header Banner -->
      <div class="flex items-center justify-between pb-6 border-b border-slate-200">
        <div class="flex items-center gap-5">
          <div class="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ExclamationTriangleIcon class="w-7 h-7 text-rose-600" />
          </div>
          <div>
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('circulation.overduePage.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 mt-1">{{ $t('circulation.overduePage.subtitle') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.overdue') }}
        </span>
      </div>

      <!-- Overdue Table Component Container -->
      <div class="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <OverdueTable
          :items="store.overdueBorrows"
          :loading="store.loading"
          @return="returningBorrow = $event"
          @remind="handleRemind"
        />
      </div>

      <!-- Pagination -->
      <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
        <button
          v-for="p in store.pagination.last_page" :key="p"
          @click="store.fetchOverdue(p)"
          class="w-8 h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs"
          :class="p === store.pagination.current_page ? 'bg-rose-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-rose-50'"
        >
          {{ p }}
        </button>
      </div>

    </div>

    <!-- Return Modal Form -->
    <ReturnForm
      v-if="returningBorrow"
      :borrow="returningBorrow"
      :loading="store.loading"
      :error-message="returnError"
      @submit="handleReturnSubmit"
      @cancel="returningBorrow = null"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useCirculationStore } from '../store/circulationStore'
import OverdueTable from '../components/OverdueTable.vue'
import ReturnForm from '../components/ReturnForm.vue'

const store = useCirculationStore()
const returningBorrow = ref(null)
const returnError = ref('')
const { t } = useI18n()

async function handleReturnSubmit(payload) {
  returnError.value = ''
  const result = await store.returnBook(returningBorrow.value.id, payload.condition, payload)
  if (result.success) {
    alert(result.message)
    returningBorrow.value = null
    store.fetchOverdue(store.pagination.current_page)
  } else {
    returnError.value = result.message
  }
}

function handleRemind(borrow) {
  alert(t('circulation.overduePage.reminderSent', { name: borrow.member?.user?.name }))
}

onMounted(() => store.fetchOverdue())
</script>