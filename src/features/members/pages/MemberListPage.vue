<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">Manage Members</h1>
          <p class="text-xs font-medium text-slate-500 mt-1">Control library user accounts, membership types, and active statuses.</p>
        </div>
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span class="text-base leading-none">+</span>
          <span>Create New Member</span>
        </button>
      </div>

      <!-- ============ STAT CARDS ============ -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <!-- Total Members -->
        <div class="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-300 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-400">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <UsersIcon class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-100 px-2.5 py-1 rounded-full">Database</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ store.pagination.total || 0 }}</p>
            <p class="text-[11px] font-bold text-blue-700 tracking-wide">Total registered members</p>
          </div>
        </div>

        <!-- Active Members -->
        <div class="bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-2xl border border-emerald-300 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-400">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircleIcon class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-full">Verified</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ activeCount }}</p>
            <p class="text-[11px] font-bold text-emerald-700 tracking-wide">Active accounts</p>
          </div>
        </div>

        <!-- Inactive Members -->
        <div class="bg-gradient-to-br from-slate-100/70 via-white to-white rounded-2xl border border-slate-400 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-500">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-sm">
              <NoSymbolIcon class="w-6 h-6" />
            </div>
            <span class="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest bg-slate-200 px-2.5 py-1 rounded-full">Dormant</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ inactiveCount }}</p>
            <p class="text-[11px] font-bold text-slate-700 tracking-wide">Inactive accounts</p>
          </div>
        </div>

        <!-- Expired Members -->
        <div class="bg-gradient-to-br from-rose-50/70 via-white to-white rounded-2xl border border-rose-300 shadow-md p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-rose-400">
          <div class="flex items-center justify-between mb-4">
            <div class="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <ExclamationTriangleIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-rose-600 uppercase tracking-widest bg-rose-100 px-2.5 py-1 rounded-full">Renewal</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ expiredCount }}</p>
            <p class="text-[11px] font-bold text-rose-700 tracking-wide">Expired memberships</p>
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
            placeholder="Search by name, email, membership no..."
            class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold bg-white text-slate-800 focus:outline-emerald-600 shadow-2xs"
          />
        </div>
        <select
          v-model="store.filters.status"
          @change="store.fetchList(1)"
          class="border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
        <select
          v-model="store.filters.membership_type"
          @change="store.fetchList(1)"
          class="border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="external">External</option>
        </select>
      </div>
    </div>

    <!-- ============ TABLE CONTAINER ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100/80 border-b border-slate-300 text-slate-600 text-[10px] font-black uppercase tracking-wider">
              <th class="px-5 py-3.5">Membership No.</th>
              <th class="px-5 py-3.5">Name</th>
              <th class="px-5 py-3.5">Email</th>
              <th class="px-5 py-3.5">Type</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-xs font-medium text-slate-700">
            <tr v-if="store.loading">
              <td colspan="6" class="text-center py-16 text-slate-400">
                <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading members...</p>
              </td>
            </tr>
            <tr v-else-if="!store.members.length">
              <td colspan="6" class="text-center py-16 text-slate-400">
                <span class="text-3xl mb-2 block">👥</span>
                <p class="text-xs font-black uppercase tracking-wider text-slate-800">No members found</p>
                <p class="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or create a new member record.</p>
              </td>
            </tr>
            <tr v-for="m in store.members" :key="m.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-5 py-4">
                <span class="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">{{ m.membership_no }}</span>
              </td>
              <td class="px-5 py-4 font-bold text-slate-900">{{ m.user?.name }}</td>
              <td class="px-5 py-4 text-slate-500">{{ m.user?.email }}</td>
              <td class="px-5 py-4">
                <MembershipBadge :type="m.membership_type" />
              </td>
              <td class="px-5 py-4">
                <MembershipBadge :status="m.status" type="" class="[&>span:first-child]:hidden" />
              </td>
              <td class="px-5 py-4 text-right space-x-3">
                <router-link :to="{ name: 'member-detail', params: { id: m.id } }" class="text-emerald-600 font-bold hover:underline cursor-pointer">
                  View
                </router-link>
                <button @click="handleDelete(m)" class="text-rose-500 font-bold hover:underline cursor-pointer">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ PAGINATION ============ -->
    <div class="flex justify-center gap-2 mt-6" v-if="store.pagination.last_page > 1">
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
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900">Create New Member</h2>
            <p class="text-xs text-slate-500 mt-0.5">Register a new reader or faculty account into the system.</p>
          </div>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
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