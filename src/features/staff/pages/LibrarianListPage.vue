<template>
  <div class="space-y-6 pb-12">
    <!-- ============ MAIN CONTAINER WRAPPER ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-8 space-y-8">
      
      <!-- Header -->
      <div class="flex items-start justify-between pb-6 border-b border-slate-200">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight">Manage Librarians</h1>
          <p class="text-xs font-semibold text-slate-500 mt-0.5">View and manage library staff members and assignments.</p>
        </div>
        <button
          @click="openCreateModal"
          class="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          + Create New Librarian
        </button>
      </div>

      <!-- Stat cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        
        <!-- Total Librarians Card -->
        <div class="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-300 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-400">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <UserGroupIcon class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-100 px-2.5 py-1 rounded-full">Total</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-blue-700 tracking-wide">Total librarians</p>
          </div>
        </div>

        <!-- Active Card -->
        <div class="bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-2xl border border-emerald-300 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-400">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircleIcon class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-full">Active</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ activeCount }}</p>
            <p class="text-[11px] font-bold text-emerald-700 tracking-wide">Active accounts</p>
          </div>
        </div>

        <!-- On Leave Card -->
        <div class="bg-gradient-to-br from-amber-50/70 via-white to-white rounded-2xl border border-amber-300 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-amber-400">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm">
              <ClockIcon class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold text-amber-600 uppercase tracking-widest bg-amber-100 px-2.5 py-1 rounded-full">Leave</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ onLeaveCount }}</p>
            <p class="text-[11px] font-bold text-amber-700 tracking-wide">On leave</p>
          </div>
        </div>

        <!-- Inactive Card -->
        <div class="bg-gradient-to-br from-slate-100/70 via-white to-white rounded-2xl border border-slate-500 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-600">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-sm">
              <NoSymbolIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest bg-slate-200 px-2.5 py-1 rounded-full">Inactive</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ inactiveCount }}</p>
            <p class="text-[11px] font-bold text-slate-700 tracking-wide">Inactive accounts</p>
          </div>
        </div>

      </div>

      <!-- Toolbar -->
      <div class="bg-slate-50/70 rounded-xl border border-slate-200 p-4">
        <div class="flex flex-wrap gap-3">
          <div class="relative flex-1 min-w-[240px]">
            <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="store.filters.search"
              @input="debouncedSearch"
              type="text"
              placeholder="Search by name, email, employee ID..."
              class="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 transition-shadow shadow-2xs"
            />
          </div>
          <select
            v-model="store.filters.status"
            @change="store.fetchList()"
            class="bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 focus:outline-emerald-600 shadow-2xs cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead class="bg-slate-100/80 text-slate-600 text-[10px] font-black uppercase tracking-wider border-b border-slate-300">
            <tr>
              <th class="px-5 py-3.5">Employee ID</th>
              <th class="px-5 py-3.5">Name</th>
              <th class="px-5 py-3.5">Department</th>
              <th class="px-5 py-3.5">Position</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-xs font-medium text-slate-700">
            <tr v-if="store.loading">
              <td colspan="6" class="text-center py-16 text-slate-400">
                <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading librarians...</p>
              </td>
            </tr>
            <tr v-else-if="!store.librarians.length">
              <td colspan="6" class="text-center py-16 text-slate-400">
                <span class="text-3xl mb-2 block">👥</span>
                <p class="text-xs font-black uppercase tracking-wider text-slate-800">No librarians found</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or create a new librarian record.</p>
              </td>
            </tr>
            <tr v-for="l in store.librarians" :key="l.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-5 py-4">
                <span class="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{{ l.employee_id }}</span>
              </td>
              <td class="px-5 py-4 font-bold text-slate-900">{{ l.user?.name }}</td>
              <td class="px-5 py-4 text-slate-500">{{ l.department || '—' }}</td>
              <td class="px-5 py-4 text-slate-500">{{ l.position || '—' }}</td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border capitalize"
                  :class="statusClass(l.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(l.status)"></span>
                  {{ l.status?.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-5 py-4 text-right space-x-3">
                <button @click="goDetail(l.id)" class="text-emerald-600 font-bold hover:underline cursor-pointer">
                  View
                </button>
                <button @click="handleDelete(l.id)" class="text-rose-500 font-bold hover:underline cursor-pointer">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
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

    </div>

    <!-- Create modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl border border-slate-300 shadow-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900">Create New Librarian</h2>
            <p class="text-xs text-slate-500 mt-0.5">Register a new staff member into the system.</p>
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
import {
  MagnifyingGlassIcon, UserGroupIcon, CheckCircleIcon,
  ClockIcon, NoSymbolIcon,
} from '@heroicons/vue/24/outline'
import { useStaffStore } from '../store/staffStore'
import LibrarianForm from '../components/LibrarianForm.vue'

const router = useRouter()
const store = useStaffStore()
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
  if (confirm('Are you sure you want to delete this Librarian?')) {
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