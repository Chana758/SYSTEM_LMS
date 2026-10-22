<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-md p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

      <div class="flex items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
        <div class="flex items-center gap-3 sm:gap-5 min-w-0">
          <div class="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-500/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <ExclamationTriangleIcon class="w-6 h-6 sm:w-7 sm:h-7 text-rose-600 dark:text-rose-400" />
          </div>
          <div class="min-w-0">
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('circulation.overduePage.title') }}</h1>
            <p class="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{{ $t('circulation.overduePage.subtitle') }}</p>
          </div>
        </div>
        <span class="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-500/20 px-3 py-1.5 rounded-xl hidden sm:inline-block">
          {{ $t('circulation.overdue') }}
        </span>
      </div>

      <!-- Load error -->
      <p v-if="store.error" class="text-xs font-semibold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
        {{ store.error }}
      </p>

      <div class="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-slate-800/50 shadow-2xs">
        <OverdueTable
          :items="store.overdueBorrows"
          :loading="store.loading"
          @return="returningBorrow = $event"
          @remind="handleRemind"
        />
      </div>

      <div class="flex flex-wrap justify-center gap-2 pt-2" v-if="store.overduePagination.last_page > 1">
        <button
          v-for="p in store.overduePagination.last_page" :key="p"
          @click="store.fetchOverdue(p)"
          class="w-9 h-9 sm:w-8 sm:h-8 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          :class="p === store.overduePagination.current_page
            ? 'bg-rose-600 text-white shadow-md'
            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/30'"
        >
          {{ p }}
        </button>
      </div>
    </div>

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
    store.fetchOverdue(store.overduePagination.current_page)
  } else {
    returnError.value = result.message
  }
}

function handleRemind(borrow) {
  alert(t('circulation.overduePage.reminderSent', { name: borrow.member?.user?.name }))
}

onMounted(() => store.fetchOverdue())
</script>