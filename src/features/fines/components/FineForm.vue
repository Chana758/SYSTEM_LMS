<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Borrow Transaction ID</label>
      <input v-model.number="form.borrow_id" type="number" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.borrow_id }" />
      <p v-if="errors.borrow_id" class="text-red-500 text-xs mt-1">{{ errors.borrow_id[0] || errors.borrow_id }}</p>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
      <input v-model.number="form.amount" type="number" step="0.01" min="0.01" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.amount }" />
      <p v-if="errors.amount" class="text-red-500 text-xs mt-1">{{ errors.amount[0] || errors.amount }}</p>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
      <select v-model="form.reason" class="w-full border rounded-lg px-3 py-2">
        <option value="overdue">Overdue</option>
        <option value="damaged">Damaged</option>
        <option value="lost">Lost</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
      <textarea v-model="form.notes" rows="3" class="w-full border rounded-lg px-3 py-2"></textarea>
    </div>
    <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>
    <div class="flex justify-end gap-2 pt-2">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50">
        {{ loading ? 'Saving...' : 'Create Fine' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({ loading: { type: Boolean, default: false }, errors: { type: Object, default: () => ({}) } })
const emit = defineEmits(['submit', 'cancel'])

const form = reactive({ borrow_id: null, amount: null, reason: 'overdue', notes: '' })

function handleSubmit() {
  emit('submit', { ...form })
}
</script>