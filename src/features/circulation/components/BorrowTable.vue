<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left px-4 py-3 font-semibold">Book</th>
            <th v-if="role !== 'member'" class="text-left px-4 py-3 font-semibold">Member</th>
            <th class="text-left px-4 py-3 font-semibold">Borrowed</th>
            <th class="text-left px-4 py-3 font-semibold">Due Date</th>
            <th class="text-left px-4 py-3 font-semibold">Status</th>
            <th class="text-left px-4 py-3 font-semibold">Renewed</th>
            <th v-if="role !== 'member'" class="text-left px-4 py-3 font-semibold">Librarian</th>
            <th class="text-right px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="items.length === 0">
            <td :colspan="role === 'member' ? 6 : 8" class="text-center py-10 text-gray-400">
              No records found
            </td>
          </tr>

          <tr
            v-for="item in items"
            :key="item.id"
            class="hover:bg-gray-50 transition-colors"
            :class="{ 'bg-red-50/40': isOverdue(item) }"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-gray-800">{{ item.book_copy?.book?.title || '—' }}</p>
              <p v-if="item.book_copy?.book?.category?.name" class="text-xs text-gray-400 mt-0.5">
                {{ item.book_copy.book.category.name }}
              </p>
            </td>

            <td v-if="role !== 'member'" class="px-4 py-3 text-gray-700">
              {{ item.member?.user?.name || '—' }}
            </td>

            <td class="px-4 py-3 text-gray-500">{{ formatDate(item.borrow_date) }}</td>

            <td class="px-4 py-3">
              <span :class="isOverdue(item) ? 'text-red-600 font-medium' : 'text-gray-700'">
                {{ formatDate(item.due_date) }}
              </span>
            </td>

            <td class="px-4 py-3">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                :class="statusClass(item)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(item)"></span>
                {{ statusLabel(item) }}
              </span>
            </td>

            <td class="px-4 py-3">
              <span class="text-gray-600">{{ item.renewed_count }}</span>
              <span class="text-gray-300"> / 2</span>
            </td>

            <td v-if="role !== 'member'" class="px-4 py-3 text-gray-500">
              {{ item.librarian?.user?.name || '—' }}
            </td>

            <td class="px-4 py-3">
              <div class="flex justify-end gap-2">
                <button
                  v-if="item.status === 'borrowed' && item.renewed_count < 2 && !isOverdue(item)"
                  @click="$emit('renew', item)"
                  class="text-xs font-medium text-green-700 border border-green-200 rounded-lg px-3 py-1.5 hover:bg-green-50 transition-colors whitespace-nowrap"
                >
                  Renew
                </button>
                <button
                  v-if="role !== 'member' && item.status === 'borrowed'"
                  @click="$emit('return', item)"
                  class="text-xs font-medium text-blue-700 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  Return
                </button>
                <span v-if="item.status === 'returned'" class="text-xs text-gray-300">—</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  role: { type: String, default: 'member' }, // 'admin' | 'librarian' | 'member'
})
defineEmits(['renew', 'return'])

function isOverdue(item) {
  return item.status === 'borrowed' && item.due_date && new Date(item.due_date) < new Date()
}

function statusLabel(item) {
  if (item.status === 'returned') return 'Returned'
  return isOverdue(item) ? 'Overdue' : 'Active'
}

function statusClass(item) {
  if (item.status === 'returned') return 'bg-gray-100 text-gray-500'
  return isOverdue(item) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
}

function statusDotClass(item) {
  if (item.status === 'returned') return 'bg-gray-400'
  return isOverdue(item) ? 'bg-red-500' : 'bg-green-500'
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>