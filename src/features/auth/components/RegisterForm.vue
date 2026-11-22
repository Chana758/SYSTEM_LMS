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

    <!-- Who is signing up: staff still check, but "outside" asks for the deposit at once -->
    <div>
      <p class="text-[11px] font-bold text-slate-600 mb-1.5">{{ $t('auth.origin.label') }}</p>
      <div class="grid grid-cols-2 gap-2">
        <button v-for="o in ['school', 'external']" :key="o" type="button" @click="form.origin = o"
          class="h-11 rounded-xl border text-xs font-bold cursor-pointer transition"
          :class="form.origin === o ? 'bg-emerald-700 border-emerald-700 text-white' : 'border-slate-300 text-slate-600 hover:border-emerald-600'">
          {{ $t('auth.origin.' + o) }}
        </button>
      </div>
      <p v-if="form.origin === 'external'" class="mt-1.5 text-[11px] text-amber-700 font-semibold">{{ $t('auth.origin.externalHint') }}</p>
    </div>

    <!-- Optional ID photo: lets staff approve in seconds -->
    <label class="block">
      <span class="text-[11px] font-bold text-slate-600">{{ $t('auth.idDocument.label') }}</span>
      <span class="mt-1.5 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 cursor-pointer hover:border-emerald-600">
        <IdentificationIcon class="w-6 h-6 text-slate-400 shrink-0" />
        <span class="text-xs text-slate-500 truncate flex-1">{{ idName || $t('auth.idDocument.choose') }}</span>
        <input type="file" accept="image/*" class="hidden" @change="pickId" />
      </span>
      <span class="block mt-1 text-[10px] text-slate-400">{{ $t('auth.idDocument.hint') }}</span>
      <span v-if="errors.id_document" class="block mt-1 text-[11px] font-semibold text-red-600">{{ errors.id_document }}</span>
    </label>

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
import { reactive, ref } from 'vue'
import { UserIcon, EnvelopeIcon, PhoneIcon, LockClosedIcon, IdentificationIcon } from '@heroicons/vue/24/outline'
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
  // Coming from the kiosk QR "?origin=external" pre-selects outside
  origin: new URLSearchParams(window.location.search).get('origin') === 'external' ? 'external' : 'school',
})

const idFile = ref(null)
const idName = ref('')

function pickId(e) {
  const f = e.target.files?.[0] || null
  idFile.value = f
  idName.value = f ? f.name : ''
}

// FormData only when there is a photo; otherwise plain JSON as before
const handleSubmit = () => {
  if (!idFile.value) return emit('submit', { ...form })
  const fd = new FormData()
  Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''))
  fd.append('id_document', idFile.value)
  emit('submit', fd)
}
</script>