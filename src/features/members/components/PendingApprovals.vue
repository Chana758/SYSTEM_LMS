<template>
  <!-- B2.3 (Sam): new registrations waiting for staff approval -->
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm space-y-4">
    <div>
      <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ t('auth.pending.tab') }}</h2>
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('auth.pending.hint') }}</p>
    </div>

    <div v-if="loading" class="py-10 text-center">
      <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
    </div>

    <p v-else-if="!rows.length" class="py-10 text-center text-sm text-slate-400">{{ t('auth.pending.empty') }}</p>

    <div v-else class="divide-y divide-slate-200 dark:divide-white/10">
      <div v-for="m in rows" :key="m.id" class="py-4 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
        <div class="min-w-0">
          <p class="font-bold text-slate-900 dark:text-white truncate">{{ m.user?.name }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ m.user?.email }} · {{ m.user?.phone || '—' }}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">{{ t('auth.pending.registered') }}: {{ formatDate(m.created_at) }}</p>
        </div>

        <label class="block">
          <span class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">{{ t('auth.pending.type') }}</span>
          <select v-model="form[m.id].membership_type" :class="inputCls">
            <option v-for="mt in membershipTypes" :key="mt.code" :value="mt.code">{{ mt.label }}</option>
          </select>
        </label>

        <label class="block">
          <span class="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">{{ t('auth.pending.studentId') }}</span>
          <input v-model="form[m.id].student_id" type="text" :class="inputCls" />
        </label>

        <div class="flex gap-2">
          <button type="button" :disabled="busyId === m.id" @click="approve(m)"
            class="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold disabled:opacity-50 cursor-pointer">
            {{ t('auth.pending.approve') }}
          </button>
          <button type="button" :disabled="busyId === m.id" @click="reject(m)"
            class="flex-1 lg:flex-none px-4 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-400/30 dark:text-red-300 dark:hover:bg-red-500/10 text-xs font-bold disabled:opacity-50 cursor-pointer">
            {{ t('auth.pending.reject') }}
          </button>
        </div>

        <p v-if="rowErrors[m.id]" class="lg:col-span-4 text-xs font-semibold text-red-600">{{ rowErrors[m.id] }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { memberAccountService } from '../services/memberAccountService'

const props = defineProps({
  membershipTypes: { type: Array, default: () => [] },
})
const emit = defineEmits(['changed'])

const { t } = useI18n()
const toast = useToast()

const rows = ref([])
const form = reactive({})
const rowErrors = reactive({})
const loading = ref(false)
const busyId = ref(null)

const inputCls =
  'w-full h-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 text-base sm:text-sm outline-none focus:border-emerald-600'

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-GB') : '—'
}

function firstError(error) {
  const data = error.response?.data
  const fieldErrors = data?.errors ? Object.values(data.errors)[0]?.[0] : null
  return fieldErrors || data?.message || 'Error'
}

async function load() {
  loading.value = true
  try {
    const { data } = await memberAccountService.pending({ per_page: 50 })
    rows.value = data.data || []
    rows.value.forEach((m) => {
      form[m.id] = {
        membership_type: m.membership_type || props.membershipTypes[0]?.code || 'student',
        student_id: m.student_id || '',
      }
    })
  } finally {
    loading.value = false
  }
}

async function approve(m) {
  busyId.value = m.id
  rowErrors[m.id] = ''
  try {
    const payload = { membership_type: form[m.id].membership_type }
    if (form[m.id].student_id.trim()) payload.student_id = form[m.id].student_id.trim()
    const { data } = await memberAccountService.approve(m.id, payload)
    toast.success(data.message)
    rows.value = rows.value.filter((r) => r.id !== m.id)
    emit('changed')
  } catch (error) {
    rowErrors[m.id] = firstError(error)
  } finally {
    busyId.value = null
  }
}

async function reject(m) {
  if (!window.confirm(t('auth.pending.rejectConfirm'))) return
  const reason = window.prompt(t('auth.pending.rejectReason')) || ''
  busyId.value = m.id
  try {
    const { data } = await memberAccountService.reject(m.id, reason)
    toast.success(data.message)
    rows.value = rows.value.filter((r) => r.id !== m.id)
    emit('changed')
  } catch (error) {
    rowErrors[m.id] = firstError(error)
  } finally {
    busyId.value = null
  }
}

onMounted(load)
</script>
