<template>
  <div
    v-if="isAdmin && !isSelf"
    class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 shadow-2xs space-y-4"
  >
    <div>
      <h3 class="text-base font-black text-slate-900 dark:text-white tracking-tight">
        {{ t('settings.roleChange.title', 'Change role') }}
      </h3>
      <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
        {{ t('settings.roleChange.subtitle', 'Promote or demote this user. They will be signed out and must log in again.') }}
      </p>
    </div>

    <!-- Current role -->
    <div class="flex items-center gap-2 text-xs flex-wrap">
      <span class="text-slate-500 dark:text-slate-400 font-semibold">{{ t('settings.roleChange.currentRole', 'Current role') }}:</span>
      <span
        v-if="currentRole"
        class="px-2.5 py-1 rounded-full font-black uppercase tracking-wider border text-[10px]"
        :class="roleBadgeClass(currentRole)"
      >
        {{ roleLabel(currentRole) }}
      </span>
      <span v-else class="text-slate-400 dark:text-slate-500">—</span>
    </div>

    <div class="space-y-3">
      <div>
        <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
          {{ t('settings.roleChange.newRole', 'New role') }}
        </label>
        <select v-model="newRole" :class="[fieldCls, 'cursor-pointer']">
          <option value="" disabled class="bg-white dark:bg-slate-900 text-slate-400">{{ t('settings.roleChange.selectRole', 'Select a role…') }}</option>
          <option v-for="r in availableRoles" :key="r" :value="r" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ roleLabel(r) }}</option>
        </select>
      </div>

      <div>
        <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
          {{ t('settings.roleChange.note', 'Note (optional)') }}
        </label>
        <input v-model="note" type="text" maxlength="255" :class="fieldCls" />
      </div>
    </div>

    <p v-if="errorMessage" class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/20 rounded-xl px-3 py-2">
      {{ errorMessage }}
    </p>

    <button
      type="button"
      :disabled="!newRole || busy"
      class="w-full px-4 py-3 sm:py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition cursor-pointer shadow-md"
      @click="submit"
    >
      {{ busy ? t('settings.roleChange.saving', 'Saving…') : t('settings.roleChange.submit', 'Change role') }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/features/auth/store/authStore'
import { roleService } from '../services/roleService'

const props = defineProps({
  userId: { type: [Number, String], required: true },
  userName: { type: String, default: '' },
  // e.g. 'member' | 'librarian' | 'admin' (from user.role.name)
  currentRole: { type: String, default: '' },
})
const emit = defineEmits(['changed'])

const { t } = useI18n()
const toast = useToast()
const authStore = useAuthStore()

const ALL_ROLES = ['admin', 'librarian', 'member']

// text-base on phones so iOS Safari does not zoom in on focus
const fieldCls =
  'w-full border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2.5 text-base sm:text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-white dark:[color-scheme:dark] focus:outline-emerald-600'

const newRole = ref('')
const note = ref('')
const busy = ref(false)
const errorMessage = ref('')

// Only admins see this card. The backend enforces it too (role:admin).
const isAdmin = computed(() => authStore.role === 'admin')
// An admin cannot change their own role (backend rejects it as well).
// FIX: compare as strings, because one side may be a number and the other a string.
const isSelf = computed(
  () => authStore.user?.id != null && String(authStore.user.id) === String(props.userId)
)

const availableRoles = computed(() => ALL_ROLES.filter((r) => r !== props.currentRole))

function roleLabel(role) {
  const defaults = { admin: 'Admin', librarian: 'Librarian', member: 'Member' }
  return t(`settings.roleChange.roles.${role}`, defaults[role] || role)
}

function roleBadgeClass(role) {
  return {
    admin: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-500/20',
    librarian: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-500/20',
    member: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20',
  }[role] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
}

async function submit() {
  if (!newRole.value) return

  const question = `${t('settings.roleChange.confirmPrefix', 'Change role of')} ${props.userName || ''} → ${roleLabel(newRole.value)}?`
  if (!window.confirm(question)) return

  busy.value = true
  errorMessage.value = ''
  try {
    const { data } = await roleService.changeRole(props.userId, {
      role: newRole.value,
      note: note.value || undefined,
    })
    toast.success(data.message)
    newRole.value = ''
    note.value = ''
    emit('changed', data.user)
  } catch (e) {
    errorMessage.value =
      e.response?.data?.errors?.role?.[0] ||
      e.response?.data?.message ||
      t('settings.roleChange.failed', 'Failed to change role.')
  } finally {
    busy.value = false
  }
}
</script>