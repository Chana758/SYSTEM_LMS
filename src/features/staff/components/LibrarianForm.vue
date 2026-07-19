<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
        <input
          v-model="form.name"
          type="text"
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
          :class="{ 'border-red-400': errors.name }"
        />
        <p v-if="errors.name" class="text-xs text-red-600 mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input
          v-model="form.email"
          type="email"
          :disabled="isEdit"
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition disabled:bg-gray-50 disabled:text-gray-500"
          :class="{ 'border-red-400': errors.email }"
        />
        <p v-if="errors.email" class="text-xs text-red-600 mt-1">{{ errors.email }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
        <input
          v-model="form.department"
          type="text"
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
        <input
          v-model="form.position"
          type="text"
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Shift</label>
        <select
          v-model="form.shift"
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 transition"
        >
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
          <option value="full_day">Full Day</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
        <input
          v-model="form.phone_number"
          type="text"
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
        />
      </div>

      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
        <select
          v-model="form.status"
          class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 transition"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      <template v-if="!isEdit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
            :class="{ 'border-red-400': errors.password }"
          />
          <p v-if="errors.password" class="text-xs text-red-600 mt-1">{{ errors.password }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            class="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
          />
        </div>
      </template>
    </div>

    <p v-if="errors.general" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
      {{ errors.general }}
    </p>

    <div class="flex justify-end gap-3 pt-2">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition"
      >
        Cancel
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="px-5 py-2.5 bg-green-700 text-white text-sm font-medium rounded-xl hover:bg-green-800 active:scale-[0.98] transition disabled:opacity-50"
      >
        {{ loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Librarian' }}
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
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  department: '',
  position: '',
  shift: 'morning',
  phone_number: '',
  status: 'active',
})

watch(
  () => props.initialData,
  (data) => {
    if (!data || !Object.keys(data).length) return
    form.name = data.user?.name || ''
    form.email = data.user?.email || ''
    form.department = data.department || ''
    form.position = data.position || ''
    form.shift = data.shift || 'morning'
    form.phone_number = data.phone_number || ''
    form.status = data.status || 'active'
  },
  { immediate: true }
)

const handleSubmit = () => {
  emit('submit', { ...form })
}
</script>