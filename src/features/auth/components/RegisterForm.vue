<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.name') }}</label>
      <input
        v-model="form.name"
        type="text"
        :placeholder="$t('auth.namePlaceholder')"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        :class="{ 'border-red-500': errors.name }"
      />
      <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.email') }}</label>
      <input
        v-model="form.email"
        type="email"
        placeholder="example@gmail.com"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        :class="{ 'border-red-500': errors.email }"
      />
      <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.phoneOptional') }}</label>
      <input
        v-model="form.phone"
        type="text"
        :placeholder="$t('auth.phonePlaceholder')"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.password') }}</label>
      <input
        v-model="form.password"
        type="password"
        placeholder="••••••••"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        :class="{ 'border-red-500': errors.password }"
      />
      <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('auth.confirmPassword') }}</label>
      <input
        v-model="form.password_confirmation"
        type="password"
        placeholder="••••••••"
        class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        :class="{ 'border-red-500': errors.password_confirmation }"
      />
      <p v-if="errors.password_confirmation" class="text-red-500 text-sm mt-1">
        {{ errors.password_confirmation }}
      </p>
    </div>

    <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2 font-medium disabled:opacity-50"
    >
      {{ loading ? $t('auth.signingUp') : $t('auth.signUp') }}
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'

const props = defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  password_confirmation: '',
})

function handleSubmit() {
  emit('submit', { ...form })
}
</script>