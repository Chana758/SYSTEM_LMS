<template>
  <form @submit.prevent="handleSubmit" class="space-y-3.5">
    <AuthField
      v-model="form.name"
      :label="$t('auth.name')"
      :placeholder="$t('auth.namePlaceholder')"
      autocomplete="name"
      :icon="UserIcon"
      :error="errors.name"
    />

    <AuthField
      v-model="form.email"
      :label="$t('auth.email')"
      type="email"
      placeholder="example@gmail.com"
      autocomplete="email"
      :icon="EnvelopeIcon"
      :error="errors.email"
    />

    <AuthField
      v-model="form.phone"
      :label="$t('auth.phoneOptional')"
      type="tel"
      :placeholder="$t('auth.phonePlaceholder')"
      autocomplete="tel"
      :icon="PhoneIcon"
      :error="errors.phone"
    />

    <!-- password + confirm side by side on wide screens -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
      <AuthField
        v-model="form.password"
        :label="$t('auth.password')"
        type="password"
        placeholder="••••••••"
        autocomplete="new-password"
        :icon="LockClosedIcon"
        :error="errors.password"
      />
      <AuthField
        v-model="form.password_confirmation"
        :label="$t('auth.confirmPassword')"
        type="password"
        placeholder="••••••••"
        autocomplete="new-password"
        :icon="LockClosedIcon"
        :error="errors.password_confirmation"
      />
    </div>

    <p
      v-if="errors.general"
      class="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5"
    >
      {{ errors.general }}
    </p>

    <button
      type="submit"
      :disabled="loading"
      class="w-full h-12 rounded-xl bg-[#17664b] hover:bg-[#0f5139] text-white text-sm font-bold shadow-md shadow-emerald-900/20 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer inline-flex items-center justify-center gap-2"
    >
      <span
        v-if="loading"
        class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
      ></span>
      {{ loading ? $t('auth.signingUp') : $t('auth.signUp') }}
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import AuthField from './AuthField.vue'

defineProps({
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

const handleSubmit = () => emit('submit', { ...form })
</script>