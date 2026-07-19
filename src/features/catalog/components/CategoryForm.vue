<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <h2 class="text-lg font-bold text-gray-800">
      {{ isEdit ? 'Edit Category' : 'Add New Category' }}
    </h2>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
      <input v-model="form.name" type="text" class="w-full border rounded-lg px-3 py-2" />
      <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
      <textarea v-model="form.description" rows="3" class="w-full border rounded-lg px-3 py-2"></textarea>
      <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description[0] }}</p>
    </div>

    <div class="flex gap-2">
      <button type="button" @click="$emit('cancel')" class="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50">
        Cancel
      </button>
      <button type="submit" class="flex-1 bg-green-700 hover:bg-green-800 text-white py-2.5 rounded-lg font-medium">
        {{ isEdit ? 'Save Changes' : 'Create' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Object, default: null },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit', 'cancel'])

const isEdit = computed(() => !!props.modelValue)
const form = ref({ name: '', description: '' })

watch(() => props.modelValue, (val) => {
  form.value = val ? { name: val.name, description: val.description } : { name: '', description: '' }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...form.value })
}
</script>