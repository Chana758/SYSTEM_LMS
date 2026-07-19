<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Manage Librarians</h1>
      <button
        @click="openCreateModal"
        class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        + Create New Librarian
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <UserGroupIcon class="w-[18px] h-[18px] text-blue-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.pagination.total || 0 }}</p>
          <p class="text-xs text-gray-500">Total librarians</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
          <CheckCircleIcon class="w-[18px] h-[18px] text-green-700" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ activeCount }}</p>
          <p class="text-xs text-gray-500">Active</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <ClockIcon class="w-[18px] h-[18px] text-amber-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ onLeaveCount }}</p>
          <p class="text-xs text-gray-500">On leave</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <NoSymbolIcon class="w-[18px] h-[18px] text-gray-500" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ inactiveCount }}</p>
          <p class="text-xs text-gray-500">Inactive</p>
        </div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            v-model="store.filters.search"
            @input="debouncedSearch"
            type="text"
            placeholder="Search by name, email, employee ID..."
            class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-shadow"
          />
        </div>
        <select
          v-model="store.filters.status"
          @change="store.fetchList()"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left px-5 py-3 font-semibold">Employee ID</th>
            <th class="text-left px-5 py-3 font-semibold">Name</th>
            <th class="text-left px-5 py-3 font-semibold">Department</th>
            <th class="text-left px-5 py-3 font-semibold">Position</th>
            <th class="text-left px-5 py-3 font-semibold">Status</th>
            <th class="text-right px-5 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="store.loading">
            <td colspan="6" class="text-center py-10 text-gray-400">Loading...</td>
          </tr>
          <tr v-else-if="!store.librarians.length">
            <td colspan="6" class="text-center py-10 text-gray-400">No librarians found</td>
          </tr>
          <tr v-for="l in store.librarians" :key="l.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3.5 font-mono text-xs text-gray-600">{{ l.employee_id }}</td>
            <td class="px-5 py-3.5 font-medium text-gray-800">{{ l.user?.name }}</td>
            <td class="px-5 py-3.5 text-gray-500">{{ l.department || '—' }}</td>
            <td class="px-5 py-3.5 text-gray-500">{{ l.position || '—' }}</td>
            <td class="px-5 py-3.5">
              <span
                class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                :class="statusClass(l.status)"
              >
                <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass(l.status)"></span>
                {{ l.status?.replace('_', ' ') }}
              </span>
            </td>
            <td class="px-5 py-3.5 text-right space-x-3">
              <button @click="goDetail(l.id)" class="text-green-700 hover:underline text-xs font-medium">
                View
              </button>
              <button @click="handleDelete(l.id)" class="text-red-500 hover:underline text-xs font-medium">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
      <button
        v-for="p in store.pagination.last_page" :key="p"
        @click="store.fetchList(p)"
        class="w-8 h-8 rounded-lg text-sm transition-colors"
        :class="p === store.pagination.current_page ? 'bg-green-700 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-green-50'"
      >
        {{ p }}
      </button>
    </div>

    <!-- Create modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Create New Librarian</h2>
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
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    on_leave: 'bg-amber-50 text-amber-700',
  }[status] || 'bg-gray-100 text-gray-500'
}

function statusDotClass(status) {
  return {
    active: 'bg-green-500',
    inactive: 'bg-gray-400',
    on_leave: 'bg-amber-500',
  }[status] || 'bg-gray-400'
}

onMounted(() => store.fetchList())
</script>