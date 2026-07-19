<template>
  <div class="relative" v-click-outside="close">
    <button @click="open = !open" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
      <EllipsisVerticalIcon class="w-5 h-5" />
    </button>

    <div v-if="open" class="absolute right-0 top-9 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20">
      <button @click="act('view')" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
        <EyeIcon class="w-4 h-4 text-gray-400" /> View Detail
      </button>
      <template v-if="fine.status === 'unpaid'">
        <button @click="act('pay')" class="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2">
          <BanknotesIcon class="w-4 h-4" /> Mark as Paid
        </button>
        <button @click="act('waive')" class="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2">
          <HandRaisedIcon class="w-4 h-4" /> Waive Fine
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { EllipsisVerticalIcon, EyeIcon, BanknotesIcon, HandRaisedIcon } from '@heroicons/vue/24/outline'
import { vClickOutside } from '@/directives/clickOutside'

const props = defineProps({ fine: { type: Object, required: true } })
const emit = defineEmits(['pay', 'waive', 'view'])
const open = ref(false)

function act(type) {
  emit(type)
  open.value = false
}
function close() {
  open.value = false
}
</script>