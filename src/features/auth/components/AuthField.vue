<template>
  <div>
    <label :for="id" class="block text-xs font-bold text-slate-700 mb-1.5">
      {{ label }}
    </label>

    <div class="relative">
      <component
        :is="icon"
        v-if="icon"
        class="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors peer-focus:text-[#17664b]"
      />

      <!--
        text-base on phones: iOS Safari zooms the page when an input's font-size is under 16px.
        sm:text-sm keeps the original size on larger screens.
      -->
      <input
        :id="id"
        :value="modelValue"
        :type="inputType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        @input="$emit('update:modelValue', $event.target.value)"
        class="auth-input peer w-full h-12 rounded-xl border-2 bg-slate-50 text-base sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium transition-all focus:outline-none focus:bg-white focus:ring-4"
        :class="[
          icon ? 'pl-10' : 'pl-4',
          isPassword ? 'pr-11' : 'pr-4',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500/15'
            : 'border-slate-200 focus:border-[#17664b] focus:ring-[#17664b]/15',
        ]"
      />

      <button
        v-if="isPassword"
        type="button"
        tabindex="-1"
        @click="show = !show"
        class="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        <EyeSlashIcon v-if="show" class="w-5 h-5" />
        <EyeIcon v-else class="w-5 h-5" />
      </button>
    </div>

    <p v-if="error" class="mt-1.5 text-xs font-semibold text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: { type: String, default: '' },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  icon: { type: [Object, Function], default: null },
  error: { type: String, default: '' },
})
defineEmits(['update:modelValue'])

const id = `f-${Math.random().toString(36).slice(2, 8)}`
const show = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && show.value ? 'text' : props.type))
</script>

<style scoped>
/* Chrome autofill paints its own blue/grey background — make it match the field. */
.auth-input:-webkit-autofill,
.auth-input:-webkit-autofill:hover,
.auth-input:-webkit-autofill:focus {
  -webkit-text-fill-color: #1e293b;
  caret-color: #1e293b;
  -webkit-box-shadow: 0 0 0 1000px #f8fafc inset;
  box-shadow: 0 0 0 1000px #f8fafc inset;
  transition: background-color 9999s ease-out 0s;
}
.auth-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px #ffffff inset;
  box-shadow: 0 0 0 1000px #ffffff inset;
}
</style>