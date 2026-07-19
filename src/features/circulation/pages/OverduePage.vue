<template>
  <div>
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 mb-6">
      <div class="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
        <ExclamationTriangleIcon class="w-6 h-6 text-red-500" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">Overdue Books</h1>
        <p class="text-sm text-gray-400 mt-0.5">Books past their due date, with estimated fines.</p>
      </div>
    </div>

    <OverdueTable
      :items="store.overdueBorrows"
      :loading="store.loading"
      @return="returningBorrow = $event"
      @remind="handleRemind"
    />

    <div class="flex justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchOverdue(p)"
        class="w-8 h-8 rounded-lg text-sm transition-colors"
        :class="p === store.pagination.current_page ? 'bg-red-500 text-white' : 'bg-white border text-gray-600 hover:bg-red-50'"
      >
        {{ p }}
      </button>
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
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline'
import { useCirculationStore } from '../store/circulationStore'
import OverdueTable from '../components/OverdueTable.vue'
import ReturnForm from '../components/ReturnForm.vue'

const store = useCirculationStore()
const returningBorrow = ref(null)
const returnError = ref('')

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
  alert(`Reminder sent to ${borrow.member?.user?.name} (not yet wired to backend).`)
}

onMounted(() => store.fetchOverdue())
</script>