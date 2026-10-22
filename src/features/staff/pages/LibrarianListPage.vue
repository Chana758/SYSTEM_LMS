<template>
  <div class="space-y-4 sm:space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-sm space-y-5 sm:space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 sm:pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 class="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ $t('staff.pageTitle') }}</h1>
          <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('staff.pageSubtitle') }}</p>
        </div>
        <button
          @click="openCreateModal"
          class="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white px-5 py-3 md:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span class="text-base leading-none">+</span>
          <span>{{ $t('staff.createNew') }}</span>
        </button>
      </div>

      <!-- ============ STAT CARDS (2 per row on phones) ============ -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1 sm:pt-2">
        <!-- Total -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-900 rounded-2xl border border-blue-500 dark:border-blue-300/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <UserGroupIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-blue-500/50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-400/40">{{ $t('staff.total') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-blue-100 tracking-wide">{{ $t('staff.totalLibrarians') }}</p>
          </div>
        </div>

        <!-- Active -->
        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-900 rounded-2xl border border-emerald-500 dark:border-emerald-300/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <CheckCircleIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-emerald-500/50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-400/40">{{ $t('staff.active') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ activeCount }}</p>
            <p class="text-[11px] font-bold text-emerald-100 tracking-wide">{{ $t('staff.activeAccounts') }}</p>
          </div>
        </div>

        <!-- On Leave -->
        <div class="bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-600 dark:to-amber-900 rounded-2xl border border-amber-500 dark:border-amber-300/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <ClockIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-amber-500/50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-400/40">{{ $t('staff.leave') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ onLeaveCount }}</p>
            <p class="text-[11px] font-bold text-amber-100 tracking-wide">{{ $t('staff.onLeave') }}</p>
          </div>
        </div>

        <!-- Inactive -->
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 dark:from-slate-700 dark:to-slate-900 rounded-2xl border border-slate-600 dark:border-slate-400/20 shadow-md p-4 sm:p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <NoSymbolIcon class="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.2]" />
            </div>
            <span class="hidden sm:inline text-[10px] font-black text-white uppercase tracking-widest bg-slate-600/60 dark:bg-slate-950/40 px-2.5 py-1 rounded-full border border-slate-500/40">{{ $t('staff.inactive') }}</span>
          </div>
          <div>
            <p class="text-2xl sm:text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ inactiveCount }}</p>
            <p class="text-[11px] font-bold text-slate-200 tracking-wide">{{ $t('staff.inactiveAccounts') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ TOOLBAR: search full width, status filter below on phones ============ -->
    <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-3 sm:p-4 shadow-sm">
      <div class="grid grid-cols-1 sm:flex sm:flex-wrap gap-3">
        <div class="relative sm:flex-1 sm:min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="search"
            enterkeyhint="search"
            :placeholder="$t('staff.searchPlaceholder')"
            class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-3 sm:py-2.5 text-base sm:text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-emerald-600 transition-shadow shadow-2xs"
          />
        </div>
        <select
          v-model="store.filters.status"
          @change="store.fetchList()"
          class="min-w-0 bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/15 rounded-xl px-3 sm:px-4 py-3 sm:py-2.5 text-sm sm:text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.allStatuses') }}</option>
          <option value="active" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.statusActive') }}</option>
          <option value="inactive" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.statusInactive') }}</option>
          <option value="on_leave" class="bg-white dark:bg-slate-900 text-slate-800 dark:text-white">{{ $t('staff.statusOnLeave') }}</option>
        </select>
      </div>
    </div>

    <!-- ============ LOADING / EMPTY ============ -->
    <div
      v-if="store.loading"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm text-center py-16 text-slate-400 dark:text-slate-500"
    >
      <div class="w-7 h-7 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ $t('staff.loading') }}</p>
    </div>

    <div
      v-else-if="!store.librarians.length"
      class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm text-center py-16 text-slate-400 dark:text-slate-500"
    >
      <span class="text-3xl mb-2 block">👥</span>
      <p class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white">{{ $t('staff.noneFound') }}</p>
      <p class="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{{ $t('staff.adjustOrCreate') }}</p>
    </div>

    <template v-else>
      <!-- ============ TABLE (md and up) ============ -->
      <div class="hidden md:block bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-100/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider border-b border-slate-300 dark:border-white/10">
              <tr>
                <th class="px-5 py-3.5">{{ $t('staff.colEmployeeId') }}</th>
                <th class="px-5 py-3.5">{{ $t('staff.colName') }}</th>
                <th class="px-5 py-3.5">{{ $t('staff.colDepartment') }}</th>
                <th class="px-5 py-3.5">{{ $t('staff.colPosition') }}</th>
                <th class="px-5 py-3.5">{{ $t('staff.colStatus') }}</th>
                <th class="px-5 py-3.5 text-right">{{ $t('staff.colActions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-white/5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <tr v-for="l in store.librarians" :key="l.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                <!-- Employee ID Badge -->
                <td class="px-5 py-4">
                  <span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-500/20 shadow-2xs">
                    {{ l.employee_id }}
                  </span>
                </td>

                <!-- Name with Avatar Placeholder -->
                <td class="px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-xs border border-emerald-200 dark:border-emerald-500/30 shadow-2xs">
                      {{ l.user?.name ? l.user.name.charAt(0).toUpperCase() : 'L' }}
                    </div>
                    <span class="font-bold text-slate-900 dark:text-white">{{ l.user?.name }}</span>
                  </div>
                </td>

                <!-- Department -->
                <td class="px-5 py-4">
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700">
                    {{ l.department || '—' }}
                  </span>
                </td>

                <!-- Position -->
                <td class="px-5 py-4 font-semibold text-slate-600 dark:text-slate-400">
                  {{ l.position || '—' }}
                </td>

                <!-- Status -->
                <td class="px-5 py-4">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border capitalize shadow-2xs"
                    :class="statusClass(l.status)"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(l.status)"></span>
                    {{ l.status?.replace('_', ' ') }}
                  </span>
                </td>

                <!-- Actions -->
                <td class="px-5 py-4 text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <button @click="goDetail(l.id)" class="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-bold text-[11px] transition-colors border border-emerald-200 dark:border-emerald-500/20 cursor-pointer">
                      {{ $t('staff.view') }}
                    </button>
                    <button @click="handleDelete(l.id)" class="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-bold text-[11px] transition-colors border border-rose-200 dark:border-rose-500/20 cursor-pointer">
                      {{ $t('staff.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ============ CARD LIST (phones): no sideways scrolling ============ -->
      <div class="md:hidden space-y-3">
        <div
          v-for="l in store.librarians"
          :key="l.id"
          class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 shadow-sm"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-black text-sm border border-emerald-200 dark:border-emerald-500/30 flex-shrink-0">
                {{ l.user?.name ? l.user.name.charAt(0).toUpperCase() : 'L' }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900 dark:text-white truncate">{{ l.user?.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400 truncate">{{ l.position || '—' }}</p>
              </div>
            </div>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border capitalize flex-shrink-0"
              :class="statusClass(l.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(l.status)"></span>
              {{ l.status?.replace('_', ' ') }}
            </span>
          </div>

          <div class="flex flex-wrap items-center gap-2 mt-3">
            <span class="font-mono text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-500/20">
              {{ l.employee_id }}
            </span>
            <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px] border border-slate-200 dark:border-slate-700">
              {{ l.department || '—' }}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 mt-4">
            <button
              @click="goDetail(l.id)"
              class="h-10 inline-flex items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              {{ $t('staff.view') }}
            </button>
            <button
              @click="handleDelete(l.id)"
              class="h-10 inline-flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200/60 dark:border-rose-500/20 active:scale-[0.98] transition cursor-pointer"
            >
              {{ $t('staff.delete') }}
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ PAGINATION (windowed: 1 … 4 5 6 … 20) ============ -->
    <div class="flex flex-wrap justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
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
        class="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain
               rounded-t-3xl sm:rounded-2xl border border-slate-300 dark:border-white/10 shadow-2xl space-y-4
               p-5 sm:p-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] sm:pb-8"
      >
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ $t('staff.createModal.title') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ $t('staff.createModal.subtitle') }}</p>
          </div>
          <button
            @click="showCreateModal = false"
            class="w-10 h-10 -mr-2 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold cursor-pointer"
            :aria-label="$t('common.actions.close', 'Close')"
          >✕</button>
        </div>
        <LibrarianForm
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  MagnifyingGlassIcon, UserGroupIcon, CheckCircleIcon,
  ClockIcon, NoSymbolIcon,
} from '@heroicons/vue/24/outline'
import { useStaffStore } from '../store/staffStore'
import LibrarianForm from '../components/LibrarianForm.vue'

const router = useRouter()
const store = useStaffStore()
const { t } = useI18n()
const showCreateModal = ref(false)

// NOTE: these counts only cover the CURRENT page of results.
// For exact totals across all pages, have the list API return a `stats` object.
const activeCount = computed(() => store.librarians.filter((l) => l.status === 'active').length)
const inactiveCount = computed(() => store.librarians.filter((l) => l.status === 'inactive').length)
const onLeaveCount = computed(() => store.librarians.filter((l) => l.status === 'on_leave').length)

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
  searchTimeout = setTimeout(() => store.fetchList(), 400)
}

function openCreateModal() {
  store.errors = {}
  showCreateModal.value = true
}

async function handleCreate(formData) {
  const success = await store.create(formData)
  if (success) showCreateModal.value = false
}

function goDetail(id) {
  router.push({ name: 'staff-detail', params: { id } })
}

async function handleDelete(id) {
  if (confirm(t('staff.confirmDelete'))) {
    await store.remove(id)
  }
}

function statusClass(status) {
  return {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-500/20',
    inactive: 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    on_leave: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-500/20',
  }[status] || 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
}

function statusDotClass(status) {
  return {
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    on_leave: 'bg-amber-500',
  }[status] || 'bg-slate-400'
}

onMounted(() => store.fetchList())
</script>