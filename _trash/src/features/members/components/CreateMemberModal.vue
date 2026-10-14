<template>
  <div class="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-7 relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
        ✕
      </button>

      <!-- ═══ STEP 1: Member form ═══ -->
      <div v-if="!createdQrDataUrl">
        <h2 class="text-lg font-bold text-gray-800 mb-1">{{ t('members.createMemberModal.title') }}</h2>
        <p class="text-sm text-gray-400 mb-6">{{ t('members.createMemberModal.subtitle') }}</p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.createMemberModal.fullName') }}</label>
            <input v-model="form.name" type="text" required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              :class="{ 'border-red-500': errors.name }" />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.createMemberModal.email') }}</label>
            <input v-model="form.email" type="email" required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              :class="{ 'border-red-500': errors.email }" />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.createMemberModal.phoneOptional') }}</label>
            <input v-model="form.phone" type="text"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
          </div>

          <div>
            <label class="bl ock text-sm font-medium text-gray-700 mb-1">{{ t('members.createMemberModal.tempPassword') }}</label>
            <input v-model="form.password" type="text" required minlength="8"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              :class="{ 'border-red-500': errors.password }" />
            <p class="text-xs text-gray-400 mt-1">{{ t('members.createMemberModal.tempPasswordHint') }}</p>
            <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('members.createMemberModal.membershipType') }}</label>
            <select v-model="form.membership_type"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
              <option value="student">{{ t('members.typeStudent') }}</option>
              <option value="staff">{{ t('members.typeTeacher') }}</option>
              <option value="public">{{ t('members.typeExternal') }}</option>
            </select>
          </div>

          <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

          <button type="submit" :disabled="submitting"
            class="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2.5 font-medium disabled:opacity-50">
            {{ submitting ? t('members.createMemberModal.saving') : t('members.createMemberModal.registerAndIssue') }}
          </button>
        </form>
      </div>

      <!-- ═══ STEP 2: QR card ready ═══ -->
      <div v-else class="text-center">
        <div class="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-700" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 class="text-lg font-bold text-gray-800 mb-1">{{ t('members.createMemberModal.registered') }}</h2>
        <p class="text-sm text-gray-400 mb-5">{{ form.name }} · {{ membershipNo }}</p>

        <div class="flex flex-col items-center gap-3">
          <img :src="createdQrDataUrl" alt="QR login card" class="w-48 h-48 border border-gray-100 rounded-lg" />
          <p class="text-xs text-gray-400">{{ t('members.createMemberModal.expires', { date: formatDate(createdQrExpiresAt) }) }}</p>
        </div>

        <div class="flex gap-2 mt-5">
          <a :href="createdQrDataUrl" :download="`qr-${membershipNo}.png`"
            class="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg">
            {{ t('members.createMemberModal.download') }}
          </a>
          <button @click="handlePrint"
            class="flex-1 text-sm bg-green-700 text-white hover:bg-green-800 px-4 py-2.5 rounded-lg">
            {{ t('members.createMemberModal.print') }}
          </button>
        </div>

        <button @click="$emit('created')" class="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">
          {{ t('members.createMemberModal.done') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import QRCode from 'qrcode'
// Use the actual existing memberService (method: create, not store)
import { memberService } from '../services/memberService'
import { authService } from '@/features/auth/services/authService'

const { t } = useI18n()
const emit = defineEmits(['close', 'created'])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  membership_type: 'student',
})

const errors = ref({})
const submitting = ref(false)

const createdQrDataUrl = ref('')
const createdQrExpiresAt = ref(null)
const membershipNo = ref('')

async function handleSubmit() {
  submitting.value = true
  errors.value = {}

  try {
    // 1. Create member — MemberController::store() does not issue a token. 
    // Therefore, the currently logged-in librarian/admin session 
    // remains completely unaffected. 
    // Use memberService.create() instead of .store().
    const { data } = await memberService.create(form)
    const newUserId = data.member.user.id
    membershipNo.value = data.member.membership_no

    // 2. Immediately generate a QR card for the newly created member 
    // using the currently logged-in librarian/admin session 
    // through the staff endpoint.
    const qrRes = await authService.generateQrTokenFor(newUserId)

    // 3. Encode the QR token into a QR code. 
    // The raw token will only be returned in the response once.
    createdQrDataUrl.value = await QRCode.toDataURL(qrRes.data.qr_token, {
      width: 300,
      margin: 1,
    })
    createdQrExpiresAt.value = qrRes.data.expires_at

  } catch (error) {
    if (error.response?.status === 422) {
      const backendErrors = error.response.data.errors || {}
      errors.value = Object.fromEntries(
        Object.entries(backendErrors).map(([key, msgs]) => [key, msgs[0]])
      )
    } else {
      errors.value = {
        general: error.response?.data?.message || 'Failed to register member.',
      }
    }
  } finally {
    submitting.value = false
  }
}

function handlePrint() {
  const win = window.open('', '_blank')
  win.document.write(`
    <html><body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <img src="${createdQrDataUrl.value}" style="width:300px;height:300px;" onload="window.print(); window.close();" />
    </body></html>
  `)
}

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>