<template>
  <form @submit.prevent="handleSubmit" class="space-y-4 sm:space-y-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
      <div>
        <label :for="id('name')" :class="labelCls">{{ $t('staff.form.name') }}</label>
        <input
          :id="id('name')"
          v-model="form.name"
          type="text"
          :class="[inputCls, errors.name ? errBorder : '']"
        />
        <p v-if="errors.name" class="text-xs text-rose-500 font-semibold mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label :for="id('email')" :class="labelCls">{{ $t('staff.form.email') }}</label>
        <input
          :id="id('email')"
          v-model="form.email"
          type="email"
          inputmode="email"
          autocapitalize="none"
          :disabled="isEdit"
          :class="[inputCls, 'disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-500 dark:disabled:text-slate-500', errors.email ? errBorder : '']"
        />
        <p v-if="errors.email" class="text-xs text-rose-500 font-semibold mt-1">{{ errors.email }}</p>
      </div>

      <div>
        <label :for="id('department')" :class="labelCls">{{ $t('staff.form.department') }}</label>
        <input :id="id('department')" v-model="form.department" type="text" :class="inputCls" />
      </div>

      <div>
        <label :for="id('position')" :class="labelCls">{{ $t('staff.form.position') }}</label>
        <input :id="id('position')" v-model="form.position" type="text" :class="inputCls" />
      </div>

      <div>
        <label :for="id('shift')" :class="labelCls">{{ $t('staff.form.shift') }}</label>
        <select :id="id('shift')" v-model="form.shift" :class="[inputCls, 'cursor-pointer']">
          <option value="morning" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.form.shiftMorning') }}</option>
          <option value="afternoon" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.form.shiftAfternoon') }}</option>
          <option value="evening" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.form.shiftEvening') }}</option>
          <option value="full_day" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.form.shiftFullDay') }}</option>
        </select>
      </div>

      <div>
        <label :for="id('phone')" :class="labelCls">{{ $t('staff.form.phoneNumber') }}</label>
        <input :id="id('phone')" v-model="form.phone_number" type="tel" inputmode="tel" :class="inputCls" />
      </div>

      <div v-if="isEdit">
        <label :for="id('status')" :class="labelCls">{{ $t('staff.form.status') }}</label>
        <select :id="id('status')" v-model="form.status" :class="[inputCls, 'cursor-pointer']">
          <option value="active" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.form.statusActive') }}</option>
          <option value="inactive" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.form.statusInactive') }}</option>
          <option value="on_leave" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.form.statusOnLeave') }}</option>
        </select>
      </div>

      <template v-if="!isEdit">
        <div>
          <label :for="id('password')" :class="labelCls">{{ $t('staff.form.password') }}</label>
          <input
            :id="id('password')"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            :class="[inputCls, errors.password ? errBorder : '']"
          />
          <p v-if="errors.password" class="text-xs text-rose-500 font-semibold mt-1">{{ errors.password }}</p>
        </div>
        <div>
          <label :for="id('password_confirmation')" :class="labelCls">{{ $t('staff.form.confirmPassword') }}</label>
          <input
            :id="id('password_confirmation')"
            v-model="form.password_confirmation"
            type="password"
            autocomplete="new-password"
            :class="inputCls"
          />
        </div>
      </template>
    </div>

    <p v-if="errors.general" class="text-xs font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3.5 py-2.5">
      {{ errors.general }}
    </p>

    <!-- Buttons: stacked + full width on phones, inline on larger screens -->
    <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
      <button
        type="button"
        @click="$emit('cancel')"
        class="w-full sm:w-auto px-5 py-3 sm:py-2.5 border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm sm:text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer"
      >
        {{ $t('staff.form.cancel') }}
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm sm:text-xs font-bold uppercase tracking-wider rounded-xl active:scale-[0.98] transition disabled:opacity-50 cursor-pointer shadow-md"
      >
        {{ loading ? $t('staff.form.saving') : isEdit ? $t('staff.form.saveChanges') : $t('staff.form.createLibrarian') }}
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

// Unique prefix so label[for] <-> input[id] work even if two forms exist on one page.
const uid = 'lf-' + Math.random().toString(36).slice(2, 8)
const id = (name) => `${uid}-${name}`

// Phones: text-base (16px) so iOS Safari does not zoom on focus, taller fields for thumbs.
// sm and up: original text-sm look.
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5'
const inputCls =
  'w-full border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-600 transition'
const errBorder = 'border-rose-500 dark:border-rose-500'

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