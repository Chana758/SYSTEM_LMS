<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3 items-end">
    <div>
      <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{{ t('reports.filter.from') }}</label>
      <input
        v-model="local.date_from"
        type="date"
        class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
    <div>
      <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{{ t('reports.filter.to') }}</label>
      <input
        v-model="local.date_to"
        type="date"
        class="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>

    <div v-if="statusOptions.length" class="min-w-[160px]">
      <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{{ statusLabel }}</label>
      <select
        v-model="local.status"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">{{ t('reports.filter.all') }}</option>
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <div v-if="showSearch" class="flex-1 min-w-[200px]">
      <label class="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{{ t('reports.filter.search') }}</label>
      <input
        v-model="local.search"
        type="text"
        :placeholder="t('reports.filter.searchPlaceholder')"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
    <button
      type="button"
      @click="apply"
      class="px-5 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-colors"
    >
      {{ t('reports.filter.apply') }}
    </button>
    <button
      type="button"
      @click="reset"
      class="px-4 py-2 text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-wider transition-colors"
    >
      {{ t('reports.filter.reset') }}
    </button>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  statusOptions: { type: Array, default: () => [] }, // [{value, label}] — label is already translated by the caller
  statusLabel:   { type: String, default: '' },
  showSearch:    { type: Boolean, default: true },
})

const emit = defineEmits(['apply'])

const defaults = () => ({
  date_from: '',
  date_to: '',
  status: '',
  search: '',
})

const local = reactive(defaults())

const apply = () => emit('apply', { ...local })

const reset = () => {
  Object.assign(local, defaults())
  apply()
}

// The initial auto-apply happens in onMounted() rather than at the top
// level of <script setup>, because calling apply() during setup — before
// Vue finishes mounting and wiring the parent's @apply listener — is
// fragile, especially in a component recreated on every route change (as
// this one is on every report page): the emit could fire before anyone
// is listening.
onMounted(() => {
  apply()
})
</script>