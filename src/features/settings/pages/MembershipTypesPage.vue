<template>
  <div class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="bg-white rounded-3xl border border-slate-300 p-6 md:p-8 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">Membership Types</h1>
          <p class="text-xs font-medium text-slate-500 mt-1">Control which membership types staff can assign when creating a member.</p>
        </div>
        <button
          @click="openCreate"
          class="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <span class="text-base leading-none">+</span>
          <span>Create New Membership Type</span>
        </button>
      </div>

      <!-- ============ STAT CARDS ============ -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <!-- Total -->
        <div class="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <RectangleStackIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-100 px-2.5 py-1 rounded-full">Total</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ types.length }}</p>
            <p class="text-[11px] font-bold text-blue-700 tracking-wide">Total membership types</p>
          </div>
        </div>

        <!-- Active -->
        <div class="bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-2xl border border-emerald-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircleIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2.5 py-1 rounded-full">Active</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ activeCount }}</p>
            <p class="text-[11px] font-bold text-emerald-700 tracking-wide">Active configurations</p>
          </div>
        </div>

        <!-- Inactive -->
        <div class="bg-gradient-to-br from-slate-100/70 via-white to-white rounded-2xl border border-slate-300 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-400">
          <div class="flex items-center justify-between mb-4">
            <div class="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-sm">
              <NoSymbolIcon class="w-5 h-5" />
            </div>
            <span class="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest bg-slate-200 px-2.5 py-1 rounded-full">Inactive</span>
          </div>
          <div>
            <p class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1.5">{{ inactiveCount }}</p>
            <p class="text-[11px] font-bold text-slate-700 tracking-wide">Disabled types</p>
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
            v-model="searchQuery"
            type="text"
            placeholder="Search by code, label, or description..."
            class="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold bg-white text-slate-800 focus:outline-emerald-600 shadow-2xs"
          />
        </div>
        <select
          v-model="statusFilter"
          class="border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 bg-white focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <!-- ============ TABLE CONTAINER ============ -->
    <div class="bg-white rounded-2xl border border-slate-300 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <div v-if="loading" class="text-center py-16 text-slate-400">
          <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading membership types...</p>
        </div>

        <div v-else-if="!filteredTypes.length" class="text-center py-16 text-slate-400">
          <span class="text-3xl mb-2 block">🏷️</span>
          <p class="text-xs font-black uppercase tracking-wider text-slate-800">No membership types found</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or create a new membership type.</p>
        </div>

        <table v-else class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100/80 border-b border-slate-300 text-slate-600 text-[10px] font-black uppercase tracking-wider">
              <th class="px-5 py-3.5">Code</th>
              <th class="px-5 py-3.5">Label</th>
              <th class="px-5 py-3.5">Description</th>
              <th class="px-5 py-3.5">Status</th>
              <th class="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-xs font-medium text-slate-700">
            <tr v-for="t in filteredTypes" :key="t.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-5 py-4">
                <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">{{ t.code }}</span>
              </td>
              <td class="px-5 py-4 font-bold text-slate-900">{{ t.label }}</td>
              <td class="px-5 py-4 text-slate-500 max-w-sm truncate">{{ t.description || '—' }}</td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                  :class="t.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-300'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="t.is_active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ t.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-5 py-4 text-right space-x-3">
                <button @click="openEdit(t)" class="text-emerald-600 font-bold hover:underline cursor-pointer">
                  Edit
                </button>
                <button @click="handleDelete(t)" class="text-rose-500 font-bold hover:underline cursor-pointer">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ============ CREATE/EDIT MODAL ============ -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-300 space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900">{{ editing ? 'Edit Membership Type' : 'Create New Membership Type' }}</h2>
            <p class="text-xs text-slate-500 mt-0.5">{{ editing ? 'Update this membership type\'s label and description.' : 'Add a new type staff can select when registering a member.' }}</p>
          </div>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1.5">Code</label>
            <input
              v-model="form.code"
              :disabled="!!editing"
              type="text"
              placeholder="e.g. alumni"
              class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 focus:outline-emerald-600 shadow-2xs"
            />
            <p class="text-[11px] text-slate-400 mt-1">Lowercase, no spaces — stored on records and can't be changed later.</p>
            <p v-if="formErrors.code" class="text-rose-500 font-semibold mt-1">{{ formErrors.code }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5">Label</label>
            <input
              v-model="form.label"
              type="text"
              placeholder="e.g. Alumni"
              class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-emerald-600 shadow-2xs"
            />
            <p v-if="formErrors.label" class="text-rose-500 font-semibold mt-1">{{ formErrors.label }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1.5">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="Brief summary of this membership type..."
              class="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-emerald-600 resize-none shadow-2xs"
            ></textarea>
          </div>

          <div v-if="editing" class="flex items-center gap-2.5 pt-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <label for="is_active" class="font-semibold text-slate-700 cursor-pointer">Active (visible in Create Member form)</label>
          </div>

          <p v-if="formErrors.general" class="text-rose-600 font-semibold">{{ formErrors.general }}</p>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {{ submitting ? 'Saving...' : 'Save Type' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon, RectangleStackIcon, CheckCircleIcon, NoSymbolIcon,
} from '@heroicons/vue/24/outline'
import { membershipTypeService } from '@/features/members/services/membershipTypeService'

const types = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editing = ref(null)
const submitting = ref(false)
const formErrors = ref({})

const form = reactive({ code: '', label: '', description: '', is_active: true })

const activeCount = computed(() => types.value.filter(t => t.is_active).length)
const inactiveCount = computed(() => types.value.filter(t => !t.is_active).length)

const filteredTypes = computed(() => {
  return types.value.filter(t => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch = !q ||
      t.code.toLowerCase().includes(q) ||
      t.label.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))

    const matchesStatus =
      statusFilter.value === '' ? true :
      statusFilter.value === 'active' ? t.is_active : !t.is_active

    return matchesSearch && matchesStatus
  })
})

async function loadTypes() {
  loading.value = true
  try {
    const { data } = await membershipTypeService.getAll()
    types.value = data
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  Object.assign(form, { code: '', label: '', description: '', is_active: true })
  formErrors.value = {}
  showModal.value = true
}

function openEdit(t) {
  editing.value = t
  Object.assign(form, { code: t.code, label: t.label, description: t.description || '', is_active: t.is_active })
  formErrors.value = {}
  showModal.value = true
}

async function handleSubmit() {
  submitting.value = true
  formErrors.value = {}
  try {
    if (editing.value) {
      await membershipTypeService.update(editing.value.id, form)
    } else {
      await membershipTypeService.create(form)
    }
    showModal.value = false
    await loadTypes()
  } catch (e) {
    if (e.response?.status === 422) {
      const backendErrors = e.response.data.errors || {}
      formErrors.value = Object.fromEntries(
        Object.entries(backendErrors).map(([key, msgs]) => [key, msgs[0]])
      )
    } else {
      formErrors.value = { general: e.response?.data?.message || 'Failed to save.' }
    }
  } finally {
    submitting.value = false
  }
}

async function handleDelete(t) {
  if (!confirm(`Delete "${t.label}"?`)) return
  try {
    await membershipTypeService.delete(t.id)
    await loadTypes()
  } catch (e) {
    alert(e.response?.data?.message || 'Failed to delete.')
  }
}

onMounted(loadTypes)
</script>