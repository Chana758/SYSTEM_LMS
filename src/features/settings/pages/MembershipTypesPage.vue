<template>
  <div class="space-y-6 pb-12">
    <!-- Header card: title, back/create buttons, and stat cards -->
    <div class="bg-white dark:bg-slate-800 rounded-3xl border border-slate-300 dark:border-slate-700 p-6 md:p-8 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-serif text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{{ t('settings.membershipTypes.title') }}</h1>
          <p class="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">{{ t('settings.membershipTypes.subtitle') }}</p>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            @click="goBack"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-center bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-400 border border-slate-300 dark:border-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeftIcon class="w-4 h-4 shrink-0" />
            <span>{{ t('settings.membershipTypes.back') }}</span>
          </button>
          <button
            @click="openCreate"
            class="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-center bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <span class="text-base leading-none shrink-0">+</span>
            <span>{{ t('settings.membershipTypes.createNew') }}</span>
          </button>
        </div>
      </div>

      <!-- Stat cards (Total / Active / Inactive) -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
        <div
          v-for="card in statCards"
          :key="card.key"
          class="rounded-3xl border p-6 flex flex-col justify-between min-h-[170px] shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-bl dark:bg-gradient-to-br"
          :class="card.card"
        >
          <div class="flex items-center justify-between mb-5">
            <div
              class="w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg bg-gradient-to-br dark:shadow-none dark:border dark:border-white/25 dark:from-white/30 dark:to-white/10"
              :class="card.icon"
            >
              <component :is="card.iconComponent" class="w-6 h-6" />
            </div>
            <span
              class="text-[11px] font-extrabold uppercase tracking-widest px-3.5 py-1.5 rounded-full border"
              :class="card.badge"
            >
              {{ card.badgeText }}
            </span>
          </div>
          <div>
            <p class="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
              {{ card.value }}
            </p>
            <p class="text-sm font-bold text-slate-600 dark:text-white/90 tracking-wide">
              {{ card.label }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and status filter -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 p-4 shadow-sm">
      <div class="flex flex-wrap gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <MagnifyingGlassIcon class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="t('settings.membershipTypes.searchPlaceholder')"
            class="w-full border border-slate-300 dark:border-slate-600 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-emerald-600 shadow-2xs"
          />
        </div>
        <select
          v-model="statusFilter"
          class="border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-emerald-600 shadow-2xs cursor-pointer"
        >
          <option value="">{{ t('settings.membershipTypes.allStatuses') }}</option>
          <option value="active">{{ t('settings.membershipTypes.active') }}</option>
          <option value="inactive">{{ t('settings.membershipTypes.inactive') }}</option>
        </select>
      </div>
    </div>

    <!-- Types table with loading and empty states -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <div v-if="loading" class="text-center py-16 text-slate-400">
          <div class="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('settings.membershipTypes.loading') }}</p>
        </div>

        <div v-else-if="!filteredTypes.length" class="text-center py-16 text-slate-400">
          <span class="text-3xl mb-2 block">🏷️</span>
          <p class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">{{ t('settings.membershipTypes.noneFound') }}</p>
          <p class="text-[11px] text-slate-400 mt-0.5">{{ t('settings.membershipTypes.adjustOrCreate') }}</p>
        </div>

        <table v-else class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100/80 dark:bg-slate-900/60 border-b border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[10px] font-black uppercase tracking-wider">
              <th class="px-5 py-3.5">{{ t('settings.membershipTypes.colCode') }}</th>
              <th class="px-5 py-3.5">{{ t('settings.membershipTypes.colLabel') }}</th>
              <th class="px-5 py-3.5 text-center">{{ t('settings.membershipTypes.colLoanDays') }}</th>
              <th class="px-5 py-3.5 text-center">{{ t('settings.membershipTypes.colMaxBooks') }}</th>
              <th class="px-5 py-3.5 text-center">{{ t('settings.membershipTypes.colRenewals') }}</th>
              <th class="px-5 py-3.5 text-center">{{ t('settings.membershipTypes.colFine') }}</th>
              <th class="px-5 py-3.5">{{ t('settings.membershipTypes.colStatus') }}</th>
              <th class="px-5 py-3.5 text-right">{{ t('settings.membershipTypes.colActions') }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
            <tr v-for="type in filteredTypes" :key="type.id" class="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
              <td class="px-5 py-4">
                <span class="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">{{ type.code }}</span>
              </td>
              <td class="px-5 py-4">
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ type.label }}</p>
                <p v-if="type.description" class="text-slate-500 dark:text-slate-400 max-w-xs truncate">{{ type.description }}</p>
              </td>
              <td class="px-5 py-4 text-center font-bold">{{ type.loan_days ?? 14 }}</td>
              <td class="px-5 py-4 text-center font-bold">{{ type.max_books ?? 3 }}</td>
              <td class="px-5 py-4 text-center font-bold">{{ type.max_renewals ?? 2 }} × {{ type.renew_days ?? 7 }}</td>
              <td class="px-5 py-4 text-center font-bold">{{ Number(type.fine_per_day ?? 500).toLocaleString() }}៛</td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border"
                  :class="type.is_active
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="type.is_active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  {{ type.is_active ? t('settings.membershipTypes.active') : t('settings.membershipTypes.inactive') }}
                </span>
              </td>
              <td class="px-5 py-4 text-right space-x-3 whitespace-nowrap">
                <button @click="openEdit(type)" class="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer">
                  {{ t('settings.membershipTypes.edit') }}
                </button>
                <button @click="handleDelete(type)" class="text-rose-500 dark:text-rose-400 font-bold hover:underline cursor-pointer">
                  {{ t('settings.membershipTypes.delete') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create / edit modal -->
    <div v-if="showModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 dark:border-slate-700 space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900 dark:text-slate-100">{{ editing ? t('settings.membershipTypes.modal.editTitle') : t('settings.membershipTypes.modal.createTitle') }}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ editing ? t('settings.membershipTypes.modal.editSubtitle') : t('settings.membershipTypes.modal.createSubtitle') }}</p>
          </div>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ t('settings.membershipTypes.modal.code') }}</label>
            <input
              v-model="form.code"
              :disabled="!!editing"
              type="text"
              :placeholder="t('settings.membershipTypes.modal.codePlaceholder')"
              class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 dark:placeholder:text-slate-500 disabled:bg-slate-100 dark:disabled:bg-slate-700 disabled:text-slate-400 focus:outline-emerald-600 shadow-2xs"
            />
            <p class="text-[11px] text-slate-400 mt-1">{{ t('settings.membershipTypes.modal.codeHint') }}</p>
            <p v-if="formErrors.code" class="text-rose-500 font-semibold mt-1">{{ formErrors.code }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ t('settings.membershipTypes.modal.label') }}</label>
            <input
              v-model="form.label"
              type="text"
              :placeholder="t('settings.membershipTypes.modal.labelPlaceholder')"
              class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 dark:placeholder:text-slate-500 focus:outline-emerald-600 shadow-2xs"
            />
            <p v-if="formErrors.label" class="text-rose-500 font-semibold mt-1">{{ formErrors.label }}</p>
          </div>

          <div>
            <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">{{ t('settings.membershipTypes.modal.description') }}</label>
            <textarea
              v-model="form.description"
              rows="2"
              :placeholder="t('settings.membershipTypes.modal.descriptionPlaceholder')"
              class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 dark:placeholder:text-slate-500 focus:outline-emerald-600 resize-none shadow-2xs"
            ></textarea>
          </div>

          <!-- Loan rules -->
          <div class="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
            <p class="font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">{{ t('settings.membershipTypes.modal.loanRules') }}</p>
            <div class="grid grid-cols-2 gap-3">
              <div v-for="f in ruleFields" :key="f.key">
                <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">{{ t(`settings.membershipTypes.modal.${f.label}`) }}</label>
                <input
                  v-model.number="form[f.key]"
                  type="number"
                  :min="f.min"
                  :max="f.max"
                  class="w-full border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 focus:outline-emerald-600 shadow-2xs"
                />
                <p v-if="formErrors[f.key]" class="text-rose-500 font-semibold mt-1">{{ formErrors[f.key] }}</p>
              </div>
            </div>
          </div>

          <div v-if="editing" class="flex items-center gap-2.5 pt-1 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <label for="is_active" class="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">{{ t('settings.membershipTypes.modal.activeVisible') }}</label>
          </div>

          <p v-if="formErrors.general" class="text-rose-600 font-semibold">{{ formErrors.general }}</p>

          <div class="flex justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              @click="showModal = false"
              class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-2xs"
            >
              {{ t('settings.membershipTypes.modal.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold disabled:opacity-50 transition-all cursor-pointer shadow-md"
            >
              {{ submitting ? t('settings.membershipTypes.modal.saving') : t('settings.membershipTypes.modal.saveType') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  MagnifyingGlassIcon, RectangleStackIcon, CheckCircleIcon, NoSymbolIcon, ArrowLeftIcon,
} from '@heroicons/vue/24/outline'
import { membershipTypeService } from '@/features/members/services/membershipTypeService'
import { useI18n } from 'vue-i18n'

// `t` is the translation function. Never use `t` as a callback parameter name
// in this file, or it shadows this one.
const { t } = useI18n()
const router = useRouter()

const DEFAULT_RULES = { loan_days: 14, max_books: 3, max_renewals: 2, renew_days: 7, fine_per_day: 500 }

// Loan-rule inputs rendered in the modal (limits mirror MembershipTypeRequest)
const ruleFields = [
  { key: 'loan_days',    label: 'loanDays',    min: 1, max: 365 },
  { key: 'max_books',    label: 'maxBooks',    min: 1, max: 50 },
  { key: 'max_renewals', label: 'maxRenewals', min: 0, max: 10 },
  { key: 'renew_days',   label: 'renewDays',   min: 1, max: 90 },
  { key: 'fine_per_day', label: 'finePerDay',  min: 0, max: 100000 },
]

const types = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editing = ref(null)
const submitting = ref(false)
const formErrors = ref({})

const form = reactive({ code: '', label: '', description: '', is_active: true, ...DEFAULT_RULES })

const activeCount = computed(() => types.value.filter(type => type.is_active).length)
const inactiveCount = computed(() => types.value.filter(type => !type.is_active).length)

// Stat cards. Keep full Tailwind class strings (no string concatenation)
// so Tailwind can detect them at build time.
const statCards = computed(() => [
  {
    key: 'total',
    iconComponent: RectangleStackIcon,
    badgeText: t('settings.membershipTypes.total'),
    value: types.value.length,
    label: t('settings.membershipTypes.totalTypes'),
    card: 'from-blue-100/70 via-white to-white border-blue-200 hover:border-blue-300 dark:from-blue-500 dark:via-blue-600 dark:to-blue-800 dark:border-blue-400/60 dark:hover:border-blue-300',
    icon: 'from-blue-500 to-blue-700 shadow-blue-500/30',
    badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-white/10 dark:text-white dark:border-white/40',
  },
  {
    key: 'active',
    iconComponent: CheckCircleIcon,
    badgeText: t('settings.membershipTypes.active'),
    value: activeCount.value,
    label: t('settings.membershipTypes.activeConfigs'),
    card: 'from-emerald-100/70 via-white to-white border-emerald-200 hover:border-emerald-300 dark:from-emerald-400 dark:via-emerald-600 dark:to-emerald-800 dark:border-emerald-300/60 dark:hover:border-emerald-200',
    icon: 'from-emerald-500 to-emerald-700 shadow-emerald-500/30',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-white/10 dark:text-white dark:border-white/40',
  },
  {
    key: 'inactive',
    iconComponent: NoSymbolIcon,
    badgeText: t('settings.membershipTypes.inactive'),
    value: inactiveCount.value,
    label: t('settings.membershipTypes.disabledTypes'),
    card: 'from-slate-200/70 via-white to-white border-slate-300 hover:border-slate-400 dark:from-slate-500 dark:via-slate-600 dark:to-slate-800 dark:border-slate-400/60 dark:hover:border-slate-300',
    icon: 'from-slate-600 to-slate-800 shadow-slate-500/30',
    badge: 'bg-slate-200 text-slate-700 border-slate-300 dark:bg-white/10 dark:text-white dark:border-white/40',
  },
])

const filteredTypes = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()

  return types.value.filter(type => {
    const matchesSearch = !q ||
      type.code.toLowerCase().includes(q) ||
      type.label.toLowerCase().includes(q) ||
      (type.description && type.description.toLowerCase().includes(q))

    const matchesStatus =
      statusFilter.value === '' ? true :
      statusFilter.value === 'active' ? type.is_active : !type.is_active

    return matchesSearch && matchesStatus
  })
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/settings')
}

async function loadTypes() {
  loading.value = true
  try {
    const { data } = await membershipTypeService.getAll()
    types.value = Array.isArray(data) ? data : (data?.data ?? [])
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  Object.assign(form, { code: '', label: '', description: '', is_active: true, ...DEFAULT_RULES })
  formErrors.value = {}
  showModal.value = true
}

function openEdit(type) {
  editing.value = type
  Object.assign(form, {
    code: type.code,
    label: type.label,
    description: type.description || '',
    is_active: type.is_active,
    loan_days: type.loan_days ?? DEFAULT_RULES.loan_days,
    max_books: type.max_books ?? DEFAULT_RULES.max_books,
    max_renewals: type.max_renewals ?? DEFAULT_RULES.max_renewals,
    renew_days: type.renew_days ?? DEFAULT_RULES.renew_days,
    fine_per_day: type.fine_per_day ?? DEFAULT_RULES.fine_per_day,
  })
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
      formErrors.value = { general: e.response?.data?.message || t('settings.membershipTypes.saveFailed') }
    }
  } finally {
    submitting.value = false
  }
}

async function handleDelete(type) {
  if (!confirm(t('settings.membershipTypes.confirmDelete', { label: type.label }))) return
  try {
    await membershipTypeService.delete(type.id)
    await loadTypes()
  } catch (e) {
    alert(e.response?.data?.message || t('settings.membershipTypes.deleteFailed'))
  }
}

onMounted(loadTypes)
</script>