<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
        <tr>
          <th class="text-left px-4 py-3">Book</th>
          <th class="text-left px-4 py-3">Member</th>
          <th class="text-left px-4 py-3">Due Date</th>
          <th class="text-left px-4 py-3">Days Late</th>
          <th class="text-left px-4 py-3">Est. Fine</th>
          <th class="text-right px-4 py-3">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading"><td colspan="6" class="text-center py-6 text-gray-400">Loading...</td></tr>
        <tr v-else-if="!items.length"><td colspan="6" class="text-center py-6 text-gray-400">No overdue books found</td></tr>
        <tr v-for="b in items" :key="b.id" class="border-t border-gray-100 hover:bg-red-50">
          <td class="px-4 py-3 font-medium">{{ b.book_copy?.book?.title }}</td>
          <td class="px-4 py-3">
            <p class="text-gray-700">{{ b.member?.user?.name }}</p>
            <p class="text-xs text-gray-400">{{ b.member?.membership_no }}</p>
          </td>
          <td class="px-4 py-3 text-red-600">{{ formatDate(b.due_date) }}</td>
          <td class="px-4 py-3">
            <span class="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold">
              {{ daysLate(b.due_date) }} days
            </span>
          </td>
          <td class="px-4 py-3 text-red-600 font-medium">{{ estimatedFine(b.due_date) }}៛</td>
          <td class="px-4 py-3 text-right space-x-3">
            <button @click="$emit('remind', b)" class="text-blue-600 hover:underline text-xs font-medium">Send Reminder</button>
            <button @click="$emit('return', b)" class="text-green-700 hover:underline text-xs font-medium">Return Book</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
defineEmits(['return', 'remind'])

const FINE_PER_DAY = 500

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US')
}
function daysLate(dueDate) {
  const diff = Math.floor((new Date() - new Date(dueDate)) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
function estimatedFine(dueDate) {
  return daysLate(dueDate) * FINE_PER_DAY
}
</script>