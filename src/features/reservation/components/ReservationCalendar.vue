<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-5">
    <div class="flex items-center justify-between mb-4">
      <button @click="prevMonth" class="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">‹</button>
      <h3 class="font-serif font-bold text-gray-800">{{ monthLabel }}</h3>
      <button @click="nextMonth" class="w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors">›</button>
    </div>

    <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">
      <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d">{{ d }}</span>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <div v-for="n in leadingBlanks" :key="'b' + n"></div>
      <button
        v-for="day in daysInMonth" :key="day"
        @click="$emit('selectDay', dateKey(day))"
        class="aspect-square rounded-lg text-xs flex flex-col items-center justify-center relative hover:bg-green-50 transition-colors"
        :class="isToday(day) ? 'ring-2 ring-green-600 font-semibold text-green-800' : 'text-gray-600'"
      >
        <span>{{ day }}</span>
        <span v-if="countFor(day)" class="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      </button>
    </div>

    <p class="text-xs text-gray-400 mt-3 inline-flex items-center gap-1.5">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
      reservation(s) expiring on that day
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  reservations: { type: Array, default: () => [] },
})
defineEmits(['selectDay'])

const current = ref(new Date())

const monthLabel = computed(() => current.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))

const daysInMonth = computed(() => {
  const y = current.value.getFullYear()
  const m = current.value.getMonth()
  return new Date(y, m + 1, 0).getDate()
})

const leadingBlanks = computed(() => {
  const y = current.value.getFullYear()
  const m = current.value.getMonth()
  return new Date(y, m, 1).getDay()
})

function dateKey(day) {
  const y = current.value.getFullYear()
  const m = String(current.value.getMonth() + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function countFor(day) {
  const key = dateKey(day)
  return props.reservations.filter((r) => r.expire_date?.startsWith(key)).length
}

function isToday(day) {
  const today = new Date()
  return (
    day === today.getDate() &&
    current.value.getMonth() === today.getMonth() &&
    current.value.getFullYear() === today.getFullYear()
  )
}

function prevMonth() {
  current.value = new Date(current.value.getFullYear(), current.value.getMonth() - 1, 1)
}
function nextMonth() {
  current.value = new Date(current.value.getFullYear(), current.value.getMonth() + 1, 1)
}
</script>