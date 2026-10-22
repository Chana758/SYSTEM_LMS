<template>
  <div class="relative inline-block" v-click-outside="close">
    <button @click="open = !open" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-slate-400 transition-colors">
      <EllipsisVerticalIcon class="w-5 h-5" />
    </button>

    <div v-if="open" class="absolute right-0 top-9 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-black/40 border border-gray-100 dark:border-white/10 py-1.5 z-20">
      <button @click="act('view')" class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2">
        <EyeIcon class="w-4 h-4 text-gray-400 dark:text-slate-400" /> {{ t('fines.viewDetail') }}
      </button>
      <template v-if="fine.status === 'unpaid'">
        <button @click="act('edit')" class="w-full text-left px-4 py-2 text-sm text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 flex items-center gap-2">
          <PencilSquareIcon class="w-4 h-4" /> {{ t('fines.editFine') }}
        </button>
        <button @click="act('pay')" class="w-full text-left px-4 py-2 text-sm text-green-700 dark:text-emerald-300 hover:bg-green-50 dark:hover:bg-emerald-500/10 flex items-center gap-2">
          <BanknotesIcon class="w-4 h-4" /> {{ t('fines.markAsPaid') }}
        </button>
        <button @click="act('waive')" class="w-full text-left px-4 py-2 text-sm text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 flex items-center gap-2">
          <HandRaisedIcon class="w-4 h-4" /> {{ t('fines.waiveFine') }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { EllipsisVerticalIcon, EyeIcon, PencilSquareIcon, BanknotesIcon, HandRaisedIcon } from '@heroicons/vue/24/outline'
import { vClickOutside } from '@/directives/clickOutside'

const { t } = useI18n()

const props = defineProps({ fine: { type: Object, required: true } })
const emit = defineEmits(['pay', 'waive', 'view', 'edit'])
const open = ref(false)

function act(type) {
  emit(type)
  open.value = false
}
function close() {
  open.value = false
}
</script>