<template>
  <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-md space-y-4">
    <!-- Month Navigation Header -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-200">
      <button 
        @click="prevMonth" 
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors shadow-2xs"
      >
        ‹
      </button>
      <h3 class="font-black text-slate-900 tracking-tight text-sm uppercase">{{ monthLabel }}</h3>
      <button 
        @click="nextMonth" 
        class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 flex items-center justify-center font-bold text-sm transition-colors shadow-2xs"
      >
        ›
      </button>
    </div>

    <!-- Weekday Labels -->
    <div class="grid grid-cols-7 gap-1.5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
      <span v-for="d in ['Su','Mo','Tu','We','Th','Fr','Sa']" :key="d">{{ d }}</span>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-1.5">
      <div v-for="n in leadingBlanks" :key="'b' + n"></div>
      <button
        v-for="day in daysInMonth" :key="day"
        @click="$emit('selectDay', dateKey(day))"
        class="aspect-square rounded-xl text-xs font-extrabold flex flex-col items-center justify-center relative border-2 border-transparent transition-all shadow-2xs"
        :class="[
          isToday(day) 
            ? 'bg-emerald-50 border-emerald-500 text-emerald-800' 
            : 'bg-slate-50/70 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300 text-slate-700'
        ]"
      >
        <span>{{ day }}</span>
        <span v-if="countFor(day)" class="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ring-2 ring-white"></span>
      </button>
    </div>

    <!-- Legend Footer -->
    <p class="text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-200 inline-flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-amber-500 inline-block ring-2 ring-amber-100"></span>
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