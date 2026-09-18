<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">
      <div class="flex items-start justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ $t('staff.pageTitle') }}</h1>
          <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ $t('staff.pageSubtitle') }}</p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span class="text-base leading-none">+</span>
          <span>{{ $t('staff.createNew') }}</span>
        </button>
      </div>

      <!-- ============ STAT CARDS ============ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <!-- Total Librarians (Blue Theme) -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl border border-blue-500 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <UserGroupIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-blue-500/50 px-2.5 py-1 rounded-full border border-blue-400/40">{{ $t('staff.total') }}</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-blue-100 tracking-wide">{{ $t('staff.totalLibrarians') }}</p>
          </div>
        </div>

        <!-- Active Librarians (Emerald Theme) -->
        <div class="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl border border-emerald-500 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <CheckCircleIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-emerald-500/50 px-2.5 py-1 rounded-full border border-emerald-400/40">{{ $t('staff.active') }}</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ activeCount }}</p>
            <p class="text-[11px] font-bold text-emerald-100 tracking-wide">{{ $t('staff.activeAccounts') }}</p>
          </div>
        </div>

        <!-- On Leave Librarians (Amber Theme) -->
        <div class="bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl border border-amber-500 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <ClockIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-amber-500/50 px-2.5 py-1 rounded-full border border-amber-400/40">{{ $t('staff.leave') }}</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ onLeaveCount }}</p>
            <p class="text-[11px] font-bold text-amber-100 tracking-wide">{{ $t('staff.onLeave') }}</p>
          </div>
        </div>

        <!-- Inactive Librarians (Slate Theme) -->
        <div class="bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl border border-slate-600 shadow-md p-5 flex flex-col justify-between text-white transition-all hover:shadow-lg hover:scale-[1.01]">
          <div class="flex items-center justify-between mb-4">
            <div class="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <NoSymbolIcon class="w-6 h-6 text-white stroke-[2.2]" />
            </div>
            <span class="text-[10px] font-black text-white uppercase tracking-widest bg-slate-600/60 px-2.5 py-1 rounded-full border border-slate-500/40">{{ $t('staff.inactive') }}</span>
          </div>
          <div>
            <p class="text-3xl font-black tracking-tight leading-none mb-1.5 text-white">{{ inactiveCount }}</p>
            <p class="text-[11px] font-bold text-slate-200 tracking-wide">{{ $t('staff.inactiveAccounts') }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ TOOLBAR ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 p-4 shadow-sm">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="text"
            :placeholder="$t('staff.searchPlaceholder')"
            class="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 transition-shadow shadow-2xs"
          />
        </div>
        <select
          v-model="store.filters.status"
          @change="store.fetchList()"
          class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="">{{ $t('staff.allStatuses') }}</option>
          <option value="active">{{ $t('staff.statusActive') }}</option>
          <option value="inactive">{{ $t('staff.statusInactive') }}</option>
          <option value="on_leave">{{ $t('staff.statusOnLeave') }}</option>
        </select>
      </div>
    </div>

    <!-- ============ TABLE CONTAINER ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-100/80 text-slate-600 text-[10px] font-black uppercase tracking-wider border-b border-slate-300">
            <tr>
              <th class="px-5 py-3.5">{{ $t('staff.colEmployeeId') }}</th>
              <th class="px-5 py-3.5">{{ $t('staff.colName') }}</th>
              <th class="px-5 py-3.5">{{ $t('staff.colDepartment') }}</th>
              <th class="px-5 py-3.5">{{ $t('staff.colPosition') }}</th>
              <th class="px-5 py-3.5">{{ $t('staff.colStatus') }}</th>
              <th class="px-5 py-3.5 text-right">{{ $t('staff.colActions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-xs font-medium text-slate-700">
            <tr v-if="store.loading">
              <td colspan="6" class="text-center py-16 text-slate-400">
                <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ $t('staff.loading') }}</p>
              </td>
            </tr>
            <tr v-else-if="!store.librarians.length">
              <td colspan="6" class="text-center py-16 text-slate-400">
                <span class="text-3xl mb-2 block">👥</span>
                <p class="text-xs font-black uppercase tracking-wider text-slate-800">{{ $t('staff.noneFound') }}</p>
                <p class="text-[11px] text-slate-400 mt-0.5">{{ $t('staff.adjustOrCreate') }}</p>
              </td>
            </tr>
            <tr v-for="l in store.librarians" :key="l.id" class="hover:bg-slate-50/80 transition-colors">
              <!-- Employee ID Badge -->
              <td class="px-5 py-4">
                <span class="font-mono font-bold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-200 shadow-2xs">
                  {{ l.employee_id }}
                </span>
              </td>

              <!-- Name with Avatar Placeholder -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs border border-emerald-200 shadow-2xs">
                    {{ l.user?.name ? l.user.name.charAt(0).toUpperCase() : 'L' }}
                  </div>
                  <span class="font-bold text-slate-900">{{ l.user?.name }}</span>
                </div>
              </td>

              <!-- Department -->
              <td class="px-5 py-4">
                <span class="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                  {{ l.department || '—' }}
                </span>
              </td>

              <!-- Position -->
              <td class="px-5 py-4 font-semibold text-slate-600">
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
                  <button @click="goDetail(l.id)" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors border border-emerald-200 cursor-pointer">
                    {{ $t('staff.view') }}
                  </button>
                  <button @click="handleDelete(l.id)" class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-[11px] transition-colors border border-rose-200 cursor-pointer">
                    {{ $t('staff.delete') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ PAGINATION ============ -->
    <div class="flex justify-center gap-2 pt-2" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchList(p)"
        class="w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
        :class="p === store.pagination.current_page ? 'bg-emerald-700 text-white shadow-md' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'"
      >
        {{ p }}
      </button>
    </div>

    <!-- ============ CREATE MODAL ============ -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl border border-slate-300 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900">{{ $t('staff.createModal.title') }}</h2>
            <p class="text-xs text-slate-500 mt-0.5">{{ $t('staff.createModal.subtitle') }}</p>
          </div>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
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

const activeCount = computed(() => store.librarians.filter((l) => l.status === 'active').length)
const inactiveCount = computed(() => store.librarians.filter((l) => l.status === 'inactive').length)
const onLeaveCount = computed(() => store.librarians.filter((l) => l.status === 'on_leave').length)

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
    active: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    inactive: 'bg-slate-100 text-slate-600 border-slate-300',
    on_leave: 'bg-amber-50 text-amber-700 border-amber-300',
  }[status] || 'bg-slate-100 text-slate-600 border-slate-300'
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