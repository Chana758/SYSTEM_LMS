<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.name') }}</label>
        <input v-model="form.name" type="text" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.name }" />
        <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.email') }}</label>
        <input v-model="form.email" type="email" :disabled="isEdit" class="w-full border rounded-lg px-3 py-2 disabled:bg-gray-100" :class="{ 'border-red-500': errors.email }" />
        <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
      </div>
    </div>

    <div v-if="!isEdit" class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.password') }}</label>
        <input v-model="form.password" type="password" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.password }" />
        <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.confirmPassword') }}</label>
        <input v-model="form.password_confirmation" type="password" class="w-full border rounded-lg px-3 py-2" :class="{ 'border-red-500': errors.password_confirmation }" />
        <p v-if="errors.password_confirmation" class="text-red-500 text-sm mt-1">{{ errors.password_confirmation }}</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.phoneNumber') }}</label>
        <input v-model="form.phone" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.identityCardNo') }}</label>
        <input v-model="form.identity_card_no" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.membershipType') }}</label>
        <!-- FIX: was a hardcoded 3-option list (student/teacher/external).
             Now fetched live from the membership_types master table so
             admin can add/rename/retire types from Settings →
             Membership Types with zero code changes here. -->
        <select
          v-model="form.membership_type"
          class="w-full border rounded-lg px-3 py-2"
          :class="{ 'border-red-500': errors.membership_type }"
          :disabled="loadingTypes"
        >
          <option v-for="t2 in membershipTypes" :key="t2.code" :value="t2.code">{{ t2.label }}</option>
        </select>
        <p v-if="errors.membership_type" class="text-red-500 text-sm mt-1">{{ errors.membership_type }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.maxBorrowLimit') }}</label>
        <input v-model.number="form.max_borrow_limit" type="number" min="1" max="20" class="w-full border rounded-lg px-3 py-2" />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.emergencyContact') }}</label>
        <input v-model="form.emergency_contact" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>
      <div v-if="isEdit">
        <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.status') }}</label>
        <select v-model="form.status" class="w-full border rounded-lg px-3 py-2">
          <option value="active">{{ t('members.statusActive') }}</option>
          <option value="inactive">{{ t('members.statusInactive') }}</option>
          <option value="expired">{{ t('members.statusExpired') }}</option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.form.address') }}</label>
      <textarea v-model="form.address" rows="2" class="w-full border rounded-lg px-3 py-2"></textarea>
    </div>

    <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

    <div class="flex justify-end gap-2 pt-2">
      <button type="button" @click="$emit('cancel')" class="px-4 py-2 border rounded-lg text-gray-600">{{ t('common.actions.cancel') }}</button>
      <button type="submit" :disabled="loading" class="px-4 py-2 bg-green-700 text-white rounded-lg disabled:opacity-50">
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

const form = reactive({
  name: '', email: '', password: '', password_confirmation: '',
  phone: '', identity_card_no: '', emergency_contact: '',
  membership_type: 'student', max_borrow_limit: 3, address: '', status: 'active',
})

const submitLabel = computed(() => {
  if (props.loading) return t('members.form.saving')
  return props.isEdit ? t('members.form.saveChanges') : t('members.form.createMember')
})

// FIX: dynamic membership type list, fetched from the backend master
// table (GET /membership-types?active_only=1). Falls back to the
// original 3 hardcoded options only if the API call fails, so the
// form is never left completely unusable.
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
    if (data.length) membershipTypes.value = data
  } catch (e) {
    // keep fallback list — form still usable even if this call fails
  } finally {
    loadingTypes.value = false
  }
}

onMounted(loadMembershipTypes)

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