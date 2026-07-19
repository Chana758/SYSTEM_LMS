<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input v-model="form.name" type="text" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.name }" />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input v-model="form.email" type="email" :disabled="isEdit" class="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100" :class="{ 'border-red-500': errors.email }" />
        <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
      </div>
    </div>

    <div v-if="!isEdit" class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input v-model="form.password" type="password" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.password }" />
        <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <input v-model="form.password_confirmation" type="password" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.password_confirmation }" />
        <p v-if="errors.password_confirmation" class="text-red-500 text-sm mt-1">{{ errors.password_confirmation }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
        <input v-model="form.phone" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Identity Card No.</label>
        <input v-model="form.identity_card_no" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Membership Type</label>
        <select v-model="form.membership_type" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.membership_type }">
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="external">External</option>
        </select>
        <p v-if="errors.membership_type" class="text-red-500 text-sm mt-1">{{ errors.membership_type }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Max Borrow Limit</label>
        <input v-model.number="form.max_borrow_limit" type="number" min="1" max="20" class="w-full border rounded-lg px-3 py-2" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
        <input v-model="form.emergency_contact" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>
      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select v-model="form.status" class="w-full border rounded-lg px-3 py-2">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
      <textarea v-model="form.address" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
    </div>

    <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 border rounded-lg text-gray-600">Cancel</button>
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50">
        {{ loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Member' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

const form = reactive({
  name: '', email: '', password: '', password_confirmation: '',
  phone: '', identity_card_no: '', emergency_contact: '',
  membership_type: 'student', max_borrow_limit: 3, address: '', status: 'active',
})

watch(() => props.initialData, (data) => {
  if (data && Object.keys(data).length) {
    Object.assign(form, {
      name: data.user?.name || '',
      email: data.user?.email || '',
      phone: data.user?.phone || '',
      identity_card_no: data.identity_card_no || '',
      emergency_contact: data.emergency_contact || '',
      membership_type: data.membership_type || 'student',
      max_borrow_limit: data.max_borrow_limit || 3,
      address: data.address || '',
      status: data.status || 'active',
    })
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...form })
}
</script>