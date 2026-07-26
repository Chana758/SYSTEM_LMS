<template>
  <div class="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-7 relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
        ✕
      </button>

      <!-- ═══ STEP 1: Librarian form ═══ -->
      <div v-if="!createdQrDataUrl">
        <h2 class="text-lg font-bold text-gray-800 mb-1">Register New Librarian</h2>
        <p class="text-sm text-gray-400 mb-6">A QR login card will be issued automatically after saving.</p>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input v-model="form.name" type="text" required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              :class="{ 'border-red-500': errors.name }" />
            <p v-if="errors.name" class="text-red-500 text-sm mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input v-model="form.email" type="email" required
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              :class="{ 'border-red-500': errors.email }" />
            <p v-if="errors.email" class="text-red-500 text-sm mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input v-model="form.phone" type="text"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
            <input v-model="form.password" type="text" required minlength="8"
              class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              :class="{ 'border-red-500': errors.password }" />
            <p v-if="errors.password" class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <input v-model="form.department" type="text"
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <select v-model="form.shift"
                class="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600">
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
          </div>

          <p v-if="errors.general" class="text-red-500 text-sm">{{ errors.general }}</p>

          <button type="submit" :disabled="submitting"
            class="w-full bg-green-700 hover:bg-green-800 text-white rounded-lg py-2.5 font-medium disabled:opacity-50">
            {{ submitting ? 'Saving...' : 'Register & Issue QR Card' }}
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
        <h2 class="text-lg font-bold text-gray-800 mb-1">Librarian Registered!</h2>
        <p class="text-sm text-gray-400 mb-5">{{ form.name }} · {{ employeeId }}</p>

        <div class="flex flex-col items-center gap-3">
          <img :src="createdQrDataUrl" alt="QR login card" class="w-48 h-48 border border-gray-100 rounded-lg" />
          <p class="text-xs text-gray-400">Expires {{ formatDate(createdQrExpiresAt) }}</p>
        </div>

        <div class="flex gap-2 mt-5">
          <a :href="createdQrDataUrl" :download="`qr-${employeeId}.png`"
            class="flex-1 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg">
            Download
          </a>
          <button @click="handlePrint"
            class="flex-1 text-sm bg-green-700 text-white hover:bg-green-800 px-4 py-2.5 rounded-lg">
            Print
          </button>
        </div>

        <button @click="$emit('created')" class="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import QRCode from 'qrcode'
// staffService.create() → POST /librarians → LibrarianController::store()
// (ខុសពី AuthController::createLibrarian — /auth/create-librarian —
// ដែលជា endpoint ចាស់ ប្រើ RegisterRequest។ ទីនេះប្រើ LibrarianController
// ព្រោះ staffService.js ភ្ជាប់ទៅ ENDPOINTS.LIBRARIANS ដែលចង្អុលទៅផ្លូវនោះ)
import { staffService } from '../services/staffService'
import { authService } from '@/features/auth/services/authService'

const emit = defineEmits(['close', 'created'])

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  department: '',
  shift: 'morning',
})

const errors = ref({})
const submitting = ref(false)

const createdQrDataUrl = ref('')
const createdQrExpiresAt = ref(null)
const employeeId = ref('')

async function handleSubmit() {
  submitting.value = true
  errors.value = {}

  try {
    // 1. បង្កើត librarian — LibrarianController::store() មិន issue
    //    token ត្រឡប់មកទេ ដូច្នេះ session admin ដែលកំពុង login
    //    មិនប៉ះពាល់ទាល់តែសោះ
    const { data } = await staffService.create(form)
    const newUserId = data.librarian.user.id
    employeeId.value = data.librarian.employee_id

    // 2. ភ្លាមៗ issue QR card — admin ប៉ុណ្ណោះទើបហៅ endpoint នេះបាន
    //    សម្រាប់ target role = librarian (backend enforce រួចហើយ)
    const qrRes = await authService.generateQrTokenFor(newUserId)

    createdQrDataUrl.value = await QRCode.toDataURL(qrRes.data.qr_token, {
      width: 300,
      margin: 1,
    })
    createdQrExpiresAt.value = qrRes.data.expires_at

  } catch (error) {
    if (error.response?.status === 403) {
      errors.value = { general: error.response.data.message ?? 'You do not have permission to register librarians.' }
    } else if (error.response?.status === 422) {
      const backendErrors = error.response.data.errors || {}
      errors.value = Object.fromEntries(
        Object.entries(backendErrors).map(([key, msgs]) => [key, msgs[0]])
      )
    } else {
      errors.value = {
        general: error.response?.data?.message || 'Failed to register librarian.',
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