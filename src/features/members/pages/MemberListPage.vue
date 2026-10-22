<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm space-y-5 sm:space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="font-serif text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('members.pageTitle') }}</h1>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ t('members.pageSubtitle') }}</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-3 md:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span class="text-base leading-none">+</span>
          <span>{{ t('members.createNewMember') }}</span>
        </button>
      </div>

      <!-- ============ STAT CARDS (2 per row on phones) ============ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-1">
        <!-- Total Members -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-900 rounded-2xl border border-blue-500 dark:border-blue-300/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <UsersIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-blue-500/50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-400/40">{{ t('members.database') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-blue-100 tracking-wide">{{ t('members.totalMembers') }}</p>
          </div>
        </div>

        <!-- Active Members -->
        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-900 rounded-2xl border border-emerald-500 dark:border-emerald-300/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <CheckCircleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-emerald-500/50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-400/40">{{ t('members.verified') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ activeCount }}</p>
            <p class="text-[11px] font-bold text-emerald-100 tracking-wide">{{ t('members.activeAccounts') }}</p>
          </div>
        </div>

        <!-- Inactive Members -->
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-2xl border border-slate-600 dark:border-slate-400/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <NoSymbolIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-slate-600/60 dark:bg-slate-950/40 px-2.5 py-1 rounded-full border border-slate-500/40">{{ t('members.dormant') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ inactiveCount }}</p>
            <p class="text-[11px] font-bold text-slate-200 tracking-wide">{{ t('members.inactiveAccounts') }}</p>
          </div>
        </div>

        <!-- Expired Members -->
        <div class="bg-gradient-to-br from-rose-600 to-rose-700 dark:from-rose-600 dark:to-rose-900 rounded-2xl border border-rose-500 dark:border-rose-300/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <ExclamationTriangleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-rose-500/50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-400/40">{{ t('members.renewal') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ expiredCount }}</p>
            <p class="text-[11px] font-bold text-rose-100 tracking-wide">{{ t('members.expiredMemberships') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ TOOLBAR: search on its own row, two filters side by side on phones ============ -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-3 sm:p-4 shadow-sm">
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-3">
        <div class="relative col-span-2 sm:flex-1 sm:min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="search"
            enterkeyhint="search"
            :placeholder="t('members.searchPlaceholder')"
            class="w-full border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-emerald-600 shadow-2xs"
          />
        </div>
        <select
          v-model="store.filters.status"
          @change="store.fetchList(1)"
          class="min-w-0 border border-slate-300 dark:border-white/15 rounded-xl px-3 sm:px-4 py-3 sm:py-2.5 text-sm sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ t('members.allStatuses') }}</option>
          <option value="active" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ t('members.statusActive') }}</option>
          <option value="inactive" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ t('members.statusInactive') }}</option>
          <option value="expired" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ t('members.statusExpired') }}</option>
        </select>
        <!-- Membership types come from the same API as MemberForm -->
        <select
          v-model="store.filters.membership_type"
          @change="store.fetchList(1)"
          class="min-w-0 border border-slate-300 dark:border-white/15 rounded-xl px-3 sm:px-4 py-3 sm:py-2.5 text-sm sm:text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ t('members.allTypes') }}</option>
          <option v-for="mt in membershipTypes" :key="mt.code" :value="mt.code" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
            {{ mt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- ============ LOADING / EMPTY ============ -->
    <div
      v-if="store.loading"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm text-center py-16 text-slate-400 dark:text-slate-500"
    >
      <div class="w-7 h-7 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('members.loadingMembers') }}</p>
    </div>

    <div
      v-else-if="!store.members.length"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm text-center py-16 text-slate-400 dark:text-slate-500"
    >
      <span class="text-3xl mb-2 block">👥</span>
      <p class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">{{ t('members.noMembersFound') }}</p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{{ t('members.adjustFiltersOrCreate') }}</p>
    </div>

    <template v-else>
      <!-- ============ TABLE (md and up) ============ -->
      <div class="hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
                <th class="px-5 py-3.5">{{ t('members.membershipNo') }}</th>
                <th class="px-5 py-3.5">{{ t('members.name') }}</th>
                <th class="px-5 py-3.5">{{ t('members.email') }}</th>
                <th class="px-5 py-3.5">{{ t('members.type') }}</th>
                <th class="px-5 py-3.5">{{ t('members.status') }}</th>
                <th class="px-5 py-3.5 text-right">{{ t('members.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <tr v-for="m in store.members" :key="m.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                <td class="px-5 py-4">
                  <span class="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10">{{ m.membership_no }}</span>
                </td>
                <td class="px-5 py-4 font-bold text-slate-900 dark:text-white">{{ m.user?.name }}</td>
                <td class="px-5 py-4 text-slate-500 dark:text-slate-400">{{ m.user?.email }}</td>
                <td class="px-5 py-4">
                  <MembershipBadge :type="m.membership_type" hide-status />
                </td>
                <td class="px-5 py-4">
                  <MembershipBadge :status="m.status" hide-type />
                </td>
                <td class="px-5 py-4 text-right space-x-3">
                  <router-link :to="{ name: 'member-detail', params: { id: m.id } }" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
                    {{ t('members.view') }}
                  </router-link>
                  <button @click="handleDelete(m)" class="text-rose-500 dark:text-rose-400 font-bold hover:underline cursor-pointer">
                    {{ t('members.deleteAction') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============ CARD LIST (phones): no sideways scrolling ============ -->
      <div class="md:hidden space-y-3">
        <div
          v-for="m in store.members"
          :key="m.id"
          class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ m.user?.name }}</p>
              <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ m.user?.email }}</p>
            </div>
            <MembershipBadge :status="m.status" hide-type class="flex-shrink-0" />
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-3">
            <span class="font-mono text-xs font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10">{{ m.membership_no }}</span>
            <MembershipBadge :type="m.membership_type" hide-status />
          </div>

          <div class="grid grid-cols-2 gap-2 mt-4">
            <router-link
              :to="{ name: 'member-detail', params: { id: m.id } }"
              class="h-10 inline-flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-500/20 active:scale-[0.98] transition"
            >
              {{ t('members.view') }}
            </router-link>
            <button
              @click="handleDelete(m)"
              class="h-10 inline-flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200/60 dark:border-rose-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              {{ t('members.deleteAction') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ PAGINATION (windowed: 1 … 4 5 6 … 20) ============ -->
    <div class="flex flex-wrap justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
      <template v-for="(p, i) in visiblePages" :key="`${p}-${i}`">
        <span v-if="p === '…'" class="w-6 h-10 sm:h-9 flex items-center justify-center text-slate-400 dark:text-slate-500 text-xs font-bold select-none">…</span>
        <button
          v-else
          @click="store.fetchList(p)"
          class="w-10 h-10 sm:w-9 sm:h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          :class="p === store.pagination.current_page
            ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-md'
            : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
        >
          {{ p }}
        </button>
      </template>
    </div>

    <!-- ============ CREATE MODAL: bottom sheet on phones, centered dialog on sm+ ============ -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center z-50 sm:p-4">
      <div
        class="bg-white dark:bg-slate-800 w-full max-w-3xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain
               rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-300 dark:border-white/10 space-y-4
               p-5 sm:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] sm:pb-8"
      >
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ t('members.createModal.title') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ t('members.createModal.subtitle') }}</p>
          </div>
          <button
            @click="showCreateModal = false"
            class="w-10 h-10 -mr-2 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold cursor-pointer"
            :aria-label="t('common.actions.close', 'Close')"
          >✕</button>
        </div>
        <MemberForm
          :loading="store.loading"
          :errors="store.errors"
          @submit="handleCreate"
          @cancel="showCreateModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  MagnifyingGlassIcon, UsersIcon, CheckCircleIcon,
  NoSymbolIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import { membershipTypeService } from '../services/membershipTypeService'
import MemberForm from '../components/MemberForm.vue'
import MembershipBadge from '../components/MembershipBadge.vue'

const { t } = useI18n()
const store = useMemberStore()
const showCreateModal = ref(false)

// NOTE: these three counts only cover the CURRENT page of results.
// For exact totals across all pages, have GET /members return a `stats` object
// (total / active / inactive / expired) and read it from the store instead.
const activeCount = computed(() => store.members.filter((m) => m.status === 'active').length)
const inactiveCount = computed(() => store.members.filter((m) => m.status === 'inactive').length)
const expiredCount = computed(() => store.members.filter((m) => m.status === 'expired').length)

// ---- Membership types for the filter (same source as MemberForm) ----
const membershipTypes = ref([
  { code: 'student', label: t('members.typeStudent') },
  { code: 'teacher', label: t('members.typeTeacher') },
  { code: 'external', label: t('members.typeExternal') },
])

async function loadMembershipTypes() {
  try {
    const { data } = await membershipTypeService.getAll(true)
    if (data && data.length) membershipTypes.value = data
  } catch (e) {
    // keep fallback list
  }
}

// ---- Windowed pagination ----
const visiblePages = computed(() => {
  const last = store.pagination.last_page
  const cur = store.pagination.current_page
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const keep = new Set([1, last, cur - 1, cur, cur + 1])
  const nums = [...keep].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b)

  const out = []
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) out.push('…')
    out.push(n)
  })
  return out
})

let searchTimeout = null
function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => store.fetchList(1), 400)
}

async function handleCreate(formData) {
  const success = await store.create(formData)
  if (success) {
    showCreateModal.value = false
    store.fetchList()
  }
}

async function handleDelete(member) {
  if (!confirm(t('members.confirmDelete', { name: member.user?.name }))) return
  await store.remove(member.id)
  store.fetchList()
}

onMounted(() => {
  store.fetchList()
  loadMembershipTypes()
})
</script>