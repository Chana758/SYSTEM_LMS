<template>
  <div>
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 mb-6">
      <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
        <BookOpenIcon class="w-6 h-6 text-green-700" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">My Borrowed Books</h1>
        <p class="text-sm text-gray-400 mt-0.5">Track your active loans and renewal history.</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-200 p-6">
      <div v-if="store.myBorrows.length === 0" class="text-center py-12">
        <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
          <BookOpenIcon class="w-7 h-7 text-gray-300" />
        </div>
        <p class="text-sm font-medium text-gray-500">You have no borrow history yet</p>
      </div>

      <div class="space-y-3">
        <div v-for="b in store.myBorrows" :key="b.id" class="border border-gray-100 rounded-xl p-3 text-sm hover:border-gray-200 transition">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-800">{{ b.book_copy?.book?.title }}</p>
              <p class="text-gray-400 text-xs">
                Category: {{ b.book_copy?.book?.category?.name || '—' }}
              </p>
            </div>
            <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
              :class="badgeClass(b)">
              {{ statusLabel(b) }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 text-xs text-gray-500">
            <p>Borrowed: <span class="text-gray-700">{{ formatDate(b.borrow_date) }}</span></p>
            <p>Due Date: <span class="text-gray-700">{{ formatDate(b.due_date) }}</span></p>
            <p>Renewals: <span class="text-gray-700">{{ b.renewed_count }} / 2</span></p>
            <p v-if="b.fines?.length">
              Fines: <span class="text-red-600 font-medium">{{ totalFine(b) }}៛</span>
            </p>
          </div>

          <div v-if="b.status === 'borrowed'" class="mt-3">
            <button
              v-if="b.renewed_count < 2 && !isOverdue(b.due_date)"
              @click="handleRenew(b)"
              class="text-xs font-medium text-green-700 border border-green-200 rounded-lg px-3 py-1 hover:bg-green-50 transition"
            >
              Renew
            </button>
            <span v-else-if="isOverdue(b.due_date)" class="text-xs text-red-500">
              Overdue — cannot renew, please return in person.
            </span>
            <span v-else class="text-xs text-gray-400">Max renewals reached</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { BookOpenIcon } from '@heroicons/vue/24/outline'
import { useCirculationStore } from '../store/circulationStore'

const store = useCirculationStore()

async function handleRenew(b) {
  const result = await store.renew(b.id, true)
  alert(result.message)
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('en-US') : '—'
}
function isOverdue(dueDate) {
  return new Date(dueDate) < new Date()
}
function statusLabel(b) {
  if (b.status === 'returned') return 'Returned'
  return isOverdue(b.due_date) ? 'Overdue' : 'Active'
}
function badgeClass(b) {
  if (b.status === 'returned') return 'bg-gray-100 text-gray-600'
  return isOverdue(b.due_date) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
}
function totalFine(b) {
  return b.fines.reduce((sum, f) => sum + Number(f.amount), 0)
}

onMounted(() => store.fetchMyBorrows())
</script>