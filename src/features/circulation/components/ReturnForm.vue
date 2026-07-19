<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md">
      <h2 class="text-lg font-bold text-gray-800 mb-1">Return Book</h2>
      <p class="text-sm text-gray-500 mb-4">{{ borrow.book_copy?.book?.title }} — {{ borrow.member?.user?.name }}</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Book Condition</label>
          <select v-model="form.condition" class="w-full border rounded-lg px-3 py-2">
            <option value="good">Good</option>
            <option value="damaged">Damaged</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        <div v-if="form.condition === 'damaged'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Damage Fee (៛)</label>
          <input v-model.number="form.damage_fee" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="5000" />
        </div>

        <div v-if="form.condition === 'lost'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Lost Fee (៛)</label>
          <input v-model.number="form.lost_fee" type="number" min="0" class="w-full border rounded-lg px-3 py-2" placeholder="15000" />
        </div>

        <div v-if="form.condition !== 'good'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
          <textarea v-model="form.notes" rows="2" class="w-full border rounded-lg px-3 py-2" placeholder="Describe the issue..."></textarea>
        </div>

        <div v-if="isOverdue" class="bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-xs text-red-600">
          ⚠️ This book is {{ daysLate }} day(s) overdue — a late fine will be applied automatically.
        </div>

        <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

        <div class="flex gap-2 pt-2">
          <button type="button" @click="$emit('cancel')" class="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" :disabled="loading" class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium disabled:opacity-50">
            {{ loading ? 'Processing...' : 'Confirm Return' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue'

const props = defineProps({
  borrow: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  errorMessage: { type: String, default: '' },
})
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  condition: 'good',
  damage_fee: 5000,
  lost_fee: 15000,
  notes: '',
})

const isOverdue = computed(() => new Date(props.borrow.due_date) < new Date())
const daysLate = computed(() => {
  const diff = Math.floor((new Date() - new Date(props.borrow.due_date)) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
})

function handleSubmit() {
  const payload = { condition: form.condition, notes: form.notes || undefined }
  if (form.condition === 'damaged') payload.damage_fee = form.damage_fee
  if (form.condition === 'lost') payload.lost_fee = form.lost_fee
  emit('submit', payload)
}
</script>