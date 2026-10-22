<template>
  <!-- FIX: no extra p-6 md:p-8 here; the app layout already pads the page -->
  <div class="max-w-[1600px] mx-auto space-y-4 sm:space-y-6 pb-12">

    <!-- Header -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3 sm:gap-4 min-w-0">
        <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 flex items-center justify-center border border-emerald-100/80 dark:border-emerald-400/30 flex-shrink-0">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5zM5 14a2 2 0 00-2 2v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 00-2-2H5z" />
          </svg>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white tracking-tight">{{ t('settings.cardApprovals.title') }}</h1>
            <span class="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-100 dark:border-emerald-400/30">
              {{ t('settings.cardApprovals.adminArea') }}
            </span>
          </div>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-1 font-normal">{{ t('settings.cardApprovals.subtitle') }}</p>
        </div>
      </div>

      <button
        type="button"
        @click="loadPending"
        :disabled="loading"
        class="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer"
      >
        <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{{ t('settings.cardApprovals.refreshQueue') }}</span>
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

      <!-- Pending queue -->
      <div class="lg:col-span-2 min-w-0 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none overflow-hidden flex flex-col">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-2 flex-wrap bg-gray-50/50 dark:bg-slate-900/40">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-bold text-gray-800 dark:text-white">{{ t('settings.cardApprovals.pendingRequests') }}</h2>
            <span class="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold rounded-md">
              {{ users.length }}
            </span>
          </div>
          <span class="text-xs text-gray-400 dark:text-slate-500 font-medium">{{ t('settings.cardApprovals.autoUpdated') }}</span>
        </div>

        <div class="flex-1 min-h-[240px] sm:min-h-[320px]">
          <div v-if="loading" class="flex flex-col items-center justify-center h-52 text-gray-400 dark:text-slate-500">
            <svg class="w-8 h-8 animate-spin text-emerald-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <p class="text-xs font-medium text-gray-500 dark:text-slate-400">{{ t('settings.cardApprovals.loadingRequests') }}</p>
          </div>

          <div v-else-if="users.length === 0" class="flex flex-col items-center justify-center h-52 text-gray-400 dark:text-slate-500">
            <div class="w-12 h-12 rounded-full bg-gray-50 dark:bg-slate-700/50 flex items-center justify-center mb-2">
              <svg class="w-6 h-6 text-gray-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-xs font-semibold text-gray-500 dark:text-slate-400">{{ t('settings.cardApprovals.noPendingRequests') }}</p>
          </div>

          <template v-else>
            <!-- ===== Phone: one card per request ===== -->
            <ul class="md:hidden divide-y divide-gray-100 dark:divide-white/5">
              <li v-for="user in users" :key="user.id" class="p-4 space-y-3">
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    v-if="buildAvatarUrl(user)"
                    :src="buildAvatarUrl(user)"
                    class="w-10 h-10 rounded-lg object-cover border border-gray-200 dark:border-white/10 flex-shrink-0"
                    alt=""
                  />
                  <div
                    v-else
                    class="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-400/30 flex-shrink-0 text-xs"
                  >
                    {{ (user.name || '').slice(0, 2).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-sm text-gray-900 dark:text-slate-100 leading-snug truncate">{{ user.name }}</p>
                    <p class="text-[11px] text-gray-400 dark:text-slate-500 truncate">{{ user.email }}</p>
                  </div>
                  <span class="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide border flex-shrink-0" :class="roleBadge(user.role?.name)">
                    {{ user.role?.name || 'User' }}
                  </span>
                </div>

                <div class="flex items-center justify-between gap-3">
                  <span class="font-mono text-xs text-gray-600 dark:text-slate-300 truncate">{{ identifierOf(user) }}</span>
                  <button
                    type="button"
                    @click="handleIssue(user)"
                    :disabled="issuingId === user.id"
                    class="inline-flex items-center gap-1.5 px-4 h-10 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-60 flex-shrink-0"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    {{ t('settings.cardApprovals.issueCard') }}
                  </button>
                </div>
              </li>
            </ul>

            <!-- ===== md+: table ===== -->
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-gray-50/80 dark:bg-slate-900/40 border-b border-gray-100 dark:border-white/10 text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    <th class="py-3 px-6">{{ t('settings.cardApprovals.userDetails') }}</th>
                    <th class="py-3 px-4">{{ t('settings.cardApprovals.role') }}</th>
                    <th class="py-3 px-4">{{ t('settings.cardApprovals.identifier') }}</th>
                    <th class="py-3 px-6 text-right">{{ t('settings.cardApprovals.action') }}</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                  <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td class="py-3.5 px-6">
                      <div class="flex items-center gap-3">
                        <img
                          v-if="buildAvatarUrl(user)"
                          :src="buildAvatarUrl(user)"
                          class="w-9 h-9 rounded-lg object-cover border border-gray-200 dark:border-white/10 shadow-2xs flex-shrink-0"
                          alt=""
                        />
                        <div
                          v-else
                          class="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-400/30 flex-shrink-0 text-xs"
                        >
                          {{ (user.name || '').slice(0, 2).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-semibold text-gray-900 dark:text-slate-100 leading-snug">{{ user.name }}</p>
                          <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="py-3.5 px-4">
                      <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wide border" :class="roleBadge(user.role?.name)">
                        {{ user.role?.name || 'User' }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 font-mono text-gray-600 dark:text-slate-300">{{ identifierOf(user) }}</td>
                    <td class="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        @click="handleIssue(user)"
                        :disabled="issuingId === user.id"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer disabled:opacity-60"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                        {{ t('settings.cardApprovals.issueCard') }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>

      <!-- Card preview -->
      <div data-card-preview class="min-w-0 bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-white/10 shadow-xs dark:shadow-none p-4 sm:p-6 flex flex-col justify-between scroll-mt-20">
        <div>
          <div class="flex items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-white/10 mb-5">
            <h2 class="text-sm font-bold text-gray-800 dark:text-white">{{ t('settings.cardApprovals.cardPreview') }}</h2>
            <span class="text-[10px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-widest bg-gray-50 dark:bg-slate-700/60 px-2 py-0.5 rounded">{{ t('settings.cardApprovals.liveOutput') }}</span>
          </div>

          <div v-if="!issuedCard" class="flex flex-col items-center justify-center py-12 sm:py-16 text-center border-2 border-dashed border-gray-100 dark:border-white/10 rounded-xl bg-gray-50/50 dark:bg-slate-900/30">
            <div class="w-10 h-10 rounded-full bg-white dark:bg-slate-700/60 flex items-center justify-center shadow-2xs mb-2">
              <svg class="w-5 h-5 text-gray-300 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <p class="text-xs font-bold text-gray-700 dark:text-slate-200">{{ t('settings.cardApprovals.noCardSelected') }}</p>
            <p class="text-[11px] text-gray-400 dark:text-slate-500 mt-1 max-w-[200px] leading-normal">{{ t('settings.cardApprovals.noCardSelectedHint') }}</p>
          </div>

          <!-- Same card design used on the Settings QR page and the print window -->
          <MembershipCardDesign
            v-else
            :qr-data-url="issuedCard.qrDataUrl"
            :name="issuedCard.name"
            :avatar-url="issuedCard.avatarUrl"
            :role="issuedCard.role"
            :id-label="issuedCard.idLabel"
            :id-value="issuedCard.idValue || '—'"
            :sub-label="issuedCard.subLabel"
            :expires-at="issuedCard.expiresAt"
          />
        </div>

        <div v-if="issuedCard" class="mt-5 pt-3 border-t border-gray-100 dark:border-white/10">
          <button
            type="button"
            @click="handlePrint"
            class="w-full py-3 sm:py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            {{ t('settings.cardApprovals.printIdCard') }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { useToast } from 'vue-toastification'
import { authService } from '@/features/auth/services/authService'
import MembershipCardDesign from '@/features/settings/components/MembershipCardDesign.vue'
import { printMembershipCard } from '@/utils/printMembershipCard'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const toast = useToast()
const users = ref([])
const loading = ref(false)
const issuedCard = ref(null)
const issuingId = ref(null)

const ROLE_BADGES = {
  member: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-400/30',
  librarian: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-400/30',
  admin: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30',
}
const roleBadge = (role) => ROLE_BADGES[role] || 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'

const identifierOf = (user) =>
  user.role?.name === 'librarian'
    ? (user.librarian?.employee_id || '—')
    : (user.member?.membership_no || '—')

function buildAvatarUrl(user) {
  if (!user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${user.avatar}`
}

async function loadPending() {
  loading.value = true
  try {
    const { data } = await authService.getPendingCards()
    users.value = data.data
  } catch (e) {
    toast.error(e.response?.data?.message || t('settings.cardApprovals.loadFailed'))
  } finally {
    loading.value = false
  }
}

async function handleIssue(user) {
  if (issuingId.value) return // prevent double-issuing while a request is running
  issuingId.value = user.id
  try {
    const { data } = await authService.generateQrTokenFor(user.id)
    const qrDataUrl = await QRCode.toDataURL(data.qr_token, { width: 300, margin: 1 })

    const isLibrarian = user.role?.name === 'librarian'
    issuedCard.value = {
      qrDataUrl,
      name: user.name,
      avatarUrl: buildAvatarUrl(user),
      role: user.role?.name || 'member',
      idLabel: isLibrarian ? 'Employee ID' : 'Membership No.',
      idValue: isLibrarian ? user.librarian?.employee_id : user.member?.membership_no,
      subLabel: isLibrarian
        ? user.librarian?.department || ''
        : (user.member?.membership_type ? `${user.member.membership_type} membership` : ''),
      expiresAt: data.expires_at,
    }

    users.value = users.value.filter((u) => u.id !== user.id)

    // On phones the preview sits below the list: bring it into view
    if (window.matchMedia('(max-width: 1023px)').matches) {
      requestAnimationFrame(() =>
        document.querySelector('[data-card-preview]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      )
    }
  } catch (e) {
    toast.error(e.response?.data?.message || t('settings.cardApprovals.issueFailed'))
  } finally {
    issuingId.value = null
  }
}

function handlePrint() {
  if (!issuedCard.value) return
  printMembershipCard({ ...issuedCard.value, idValue: issuedCard.value.idValue || '—' })
}

onMounted(loadPending)
</script>