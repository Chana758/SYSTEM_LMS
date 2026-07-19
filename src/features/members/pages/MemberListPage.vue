<template>
  <div>
    <!-- Header -->
    <div class="flex items-start justify-between mb-6">
      <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Manage Members</h1>
      <button
        @click="showCreateModal = true"
        class="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
      >
        + Create New Member
      </button>
    </div>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <UsersIcon class="w-[18px] h-[18px] text-blue-600" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ store.pagination.total || 0 }}</p>
          <p class="text-xs text-gray-500">Total members</p>
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
        <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <NoSymbolIcon class="w-[18px] h-[18px] text-gray-500" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ inactiveCount }}</p>
          <p class="text-xs text-gray-500">Inactive</p>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3.5 flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
          <ExclamationTriangleIcon class="w-[18px] h-[18px] text-red-500" />
        </div>
        <div>
          <p class="text-lg font-bold text-gray-900 leading-tight">{{ expiredCount }}</p>
          <p class="text-xs text-gray-500">Expired</p>
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
            placeholder="Search by name, email, membership no..."
            class="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-shadow"
          />
        </div>
        <select
          v-model="store.filters.status"
          @change="store.fetchList(1)"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
        <select
          v-model="store.filters.membership_type"
          @change="store.fetchList(1)"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-green-600/20"
        >
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="external">External</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left px-5 py-3 font-semibold">Membership No.</th>
            <th class="text-left px-5 py-3 font-semibold">Name</th>
            <th class="text-left px-5 py-3 font-semibold">Email</th>
            <th class="text-left px-5 py-3 font-semibold">Type</th>
            <th class="text-left px-5 py-3 font-semibold">Status</th>
            <th class="text-right px-5 py-3 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="store.loading">
            <td colspan="6" class="text-center py-10 text-gray-400">Loading...</td>
          </tr>
          <tr v-else-if="!store.members.length">
            <td colspan="6" class="text-center py-10 text-gray-400">No members found</td>
          </tr>
          <tr v-for="m in store.members" :key="m.id" class="hover:bg-gray-50 transition-colors">
            <td class="px-5 py-3.5 font-mono text-xs text-gray-600">{{ m.membership_no }}</td>
            <td class="px-5 py-3.5 font-medium text-gray-800">{{ m.user?.name }}</td>
            <td class="px-5 py-3.5 text-gray-500">{{ m.user?.email }}</td>
            <td class="px-5 py-3.5">
              <MembershipBadge :type="m.membership_type" />
            </td>
            <td class="px-5 py-3.5">
              <MembershipBadge :status="m.status" type="" class="[&>span:first-child]:hidden" />
            </td>
            <td class="px-5 py-3.5 text-right space-x-3">
              <router-link :to="{ name: 'member-detail', params: { id: m.id } }" class="text-green-700 hover:underline text-xs font-medium">
                View
              </router-link>
              <button @click="handleDelete(m)" class="text-red-500 hover:underline text-xs font-medium">
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
      <div class="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold text-gray-800 mb-4">Create New Member</h2>
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
import {
  MagnifyingGlassIcon, UsersIcon, CheckCircleIcon,
  NoSymbolIcon, ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberForm from '../components/MemberForm.vue'
import MembershipBadge from '../components/MembershipBadge.vue'

const store = useMemberStore()
const showCreateModal = ref(false)

const activeCount = computed(() => store.members.filter((m) => m.status === 'active').length)
const inactiveCount = computed(() => store.members.filter((m) => m.status === 'inactive').length)
const expiredCount = computed(() => store.members.filter((m) => m.status === 'expired').length)

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
  if (!confirm(`Delete member "${member.user?.name}"? This can be restored later.`)) return
  await store.remove(member.id)
  store.fetchList(store.pagination.current_page)
}

onMounted(() => store.fetchList())
</script>