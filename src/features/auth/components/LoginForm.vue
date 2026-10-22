<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <AuthField
      v-model="form.email"
      :label="$t('auth.email')"
      type="email"
      placeholder="you@example.com"
      autocomplete="email"
      :icon="EnvelopeIcon"
      :error="errors.email"
    />

    <AuthField
      v-model="form.password"
      :label="$t('auth.password')"
      type="password"
      placeholder="••••••••"
      autocomplete="current-password"
      :icon="LockClosedIcon"
      :error="errors.password"
    />

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
      {{ loading ? $t('auth.signingIn') : $t('auth.signIn') }}
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue'
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import AuthField from './AuthField.vue'

defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit'])

const form = reactive({ email: '', password: '' })

const handleSubmit = () => emit('submit', { ...form })
</script>