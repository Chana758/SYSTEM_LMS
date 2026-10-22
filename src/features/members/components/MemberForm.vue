<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Name & Email -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label :for="id('name')" :class="labelCls">{{ t('members.form.name') }}</label>
        <input
          :id="id('name')"
          v-model="form.name"
          type="text"
          :class="[inputCls, errs.name ? errBorder : '']"
        />
        <p v-if="errs.name" class="text-rose-500 text-xs font-semibold mt-1">{{ errs.name }}</p>
      </div>

      <div>
        <label :for="id('email')" :class="labelCls">{{ t('members.form.email') }}</label>
        <input
          :id="id('email')"
          v-model="form.email"
          type="email"
          inputmode="email"
          autocapitalize="none"
          :disabled="isEdit"
          :class="[inputCls, 'disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:text-slate-500 dark:disabled:text-slate-500', errs.email ? errBorder : '']"
        />
        <p v-if="errs.email" class="text-rose-500 text-xs font-semibold mt-1">{{ errs.email }}</p>
      </div>
    </div>

    <!-- Password / Confirm Password (Create mode only) -->
    <div v-if="!isEdit" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label :for="id('password')" :class="labelCls">{{ t('members.form.password') }}</label>
        <input
          :id="id('password')"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          :class="[inputCls, errs.password ? errBorder : '']"
        />
        <p v-if="errs.password" class="text-rose-500 text-xs font-semibold mt-1">{{ errs.password }}</p>
      </div>

      <div>
        <label :for="id('password_confirmation')" :class="labelCls">{{ t('members.form.confirmPassword') }}</label>
        <input
          :id="id('password_confirmation')"
          v-model="form.password_confirmation"
          type="password"
          autocomplete="new-password"
          :class="[inputCls, errs.password_confirmation ? errBorder : '']"
        />
        <p v-if="errs.password_confirmation" class="text-rose-500 text-xs font-semibold mt-1">{{ errs.password_confirmation }}</p>
      </div>
    </div>

    <!-- Phone & Identity Card -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label :for="id('phone')" :class="labelCls">{{ t('members.form.phoneNumber') }}</label>
        <input :id="id('phone')" v-model="form.phone" type="tel" inputmode="tel" :class="inputCls" />
      </div>

      <div>
        <label :for="id('identity')" :class="labelCls">{{ t('members.form.identityCardNo') }}</label>
        <input :id="id('identity')" v-model="form.identity_card_no" type="text" :class="inputCls" />
      </div>
    </div>

    <!-- Membership Type & Max Borrow Limit -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label :for="id('type')" :class="labelCls">{{ t('members.form.membershipType') }}</label>
        <select
          :id="id('type')"
          v-model="form.membership_type"
          :class="[inputCls, 'disabled:opacity-50', errs.membership_type ? errBorder : '']"
          :disabled="loadingTypes"
        >
          <option v-for="t2 in membershipTypes" :key="t2.code" :value="t2.code" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
            {{ t2.label }}
          </option>
        </select>
        <p v-if="errs.membership_type" class="text-rose-500 text-xs font-semibold mt-1">{{ errs.membership_type }}</p>
      </div>

      <div>
        <label :for="id('limit')" :class="labelCls">{{ t('members.form.maxBorrowLimit') }}</label>
        <input
          :id="id('limit')"
          v-model.number="form.max_borrow_limit"
          type="number"
          inputmode="numeric"
          min="1"
          max="20"
          :class="[inputCls, errs.max_borrow_limit ? errBorder : '']"
        />
        <p v-if="errs.max_borrow_limit" class="text-rose-500 text-xs font-semibold mt-1">{{ errs.max_borrow_limit }}</p>
      </div>
    </div>

    <!-- Emergency Contact & Status -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label :for="id('emergency')" :class="labelCls">{{ t('members.form.emergencyContact') }}</label>
        <input :id="id('emergency')" v-model="form.emergency_contact" type="text" :class="inputCls" />
      </div>

      <div v-if="isEdit">
        <label :for="id('status')" :class="labelCls">{{ t('members.form.status') }}</label>
        <select :id="id('status')" v-model="form.status" :class="inputCls">
          <option value="active" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{{ t('members.statusActive') }}</option>
          <option value="inactive" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{{ t('members.statusInactive') }}</option>
          <option value="expired" class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{{ t('members.statusExpired') }}</option>
        </select>
      </div>
    </div>

    <!-- Address -->
    <div>
      <label :for="id('address')" :class="labelCls">{{ t('members.form.address') }}</label>
      <textarea :id="id('address')" v-model="form.address" rows="2" :class="inputCls"></textarea>
    </div>

    <p v-if="errs.general" class="text-rose-500 text-xs font-semibold">{{ errs.general }}</p>

    <!-- Action Buttons: stacked + full width on phones, inline on larger screens -->
    <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
      <button
        type="button"
        @click="$emit('cancel')"
        class="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm sm:text-xs font-bold transition cursor-pointer"
      >
        {{ t('common.actions.cancel') }}
      </button>
      <button
        type="submit"
        :disabled="loading"
        class="w-full sm:w-auto px-5 py-3 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-sm sm:text-xs font-bold transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {{ submitLabel }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { membershipTypeService } from '../services/membershipTypeService'

const { t } = useI18n()

const props = defineProps({
  initialData: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit', 'cancel'])

// Unique prefix so label[for] <-> input[id] work even if two forms exist on one page.
const uid = 'mf-' + Math.random().toString(36).slice(2, 8)
const id = (name) => `${uid}-${name}`

// Shared field styles.
// Phones: text-base (16px) so iOS Safari does not zoom in on focus, taller fields for thumbs.
// sm and up: compact text-xs look.
const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5'
const inputCls =
  'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition'
const errBorder = 'border-rose-500 dark:border-rose-500'

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  phone: '',
  identity_card_no: '',
  emergency_contact: '',
  membership_type: 'student',
  max_borrow_limit: 3,
  address: '',
  status: 'active',
})

// Client-side errors merged with server errors
const localErrors = reactive({})
const errs = computed(() => ({ ...props.errors, ...localErrors }))

const submitLabel = computed(() => {
  if (props.loading) return t('members.form.saving')
  return props.isEdit ? t('members.form.saveChanges') : t('members.form.createMember')
})

const membershipTypes = ref([
  { code: 'student', label: t('members.typeStudent') },
  { code: 'teacher', label: t('members.typeTeacher') },
  { code: 'external', label: t('members.typeExternal') },
])
const loadingTypes = ref(false)

async function loadMembershipTypes() {
  loadingTypes.value = true
  try {
    const { data } = await membershipTypeService.getAll(true) // active_only=1
    if (data && data.length) membershipTypes.value = data
  } catch (e) {
    // Keep fallback list if API call fails
  } finally {
    loadingTypes.value = false
  }
}

onMounted(loadMembershipTypes)

watch(
  () => props.initialData,
  (data) => {
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
  },
  { immediate: true }
)

function validate() {
  delete localErrors.max_borrow_limit
  const n = Number(form.max_borrow_limit)
  if (!Number.isInteger(n) || n < 1 || n > 20) {
    localErrors.max_borrow_limit = t('members.form.maxBorrowLimitInvalid', 'Enter a number between 1 and 20')
    return false
  }
  return true
}

// Clear the local error as soon as the user edits the field again
watch(
  () => form.max_borrow_limit,
  () => {
    delete localErrors.max_borrow_limit
  }
)

function handleSubmit() {
  if (!validate()) return
  emit('submit', { ...form })
}
</script>