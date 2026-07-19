<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6">
    <div class="flex items-start gap-5">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="Profile avatar"
        class="w-16 h-16 rounded-full object-cover border border-gray-200 flex-shrink-0"
      />
      <div
        v-else
        class="w-16 h-16 rounded-full bg-green-700 text-white text-xl font-bold flex items-center justify-center flex-shrink-0"
      >
        {{ initials }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-bold text-gray-900">{{ librarian.user?.name }}</h2>
            <p class="text-sm text-gray-500">{{ librarian.user?.email }}</p>
          </div>
          <span
            class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
            :class="statusClass"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="statusDotClass"></span>
            {{ librarian.status?.replace('_', ' ') }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Employee ID</p>
            <p class="text-sm font-medium text-gray-700">{{ librarian.employee_id }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Department</p>
            <p class="text-sm font-medium text-gray-700">{{ librarian.department || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Shift</p>
            <p class="text-sm font-medium text-gray-700 capitalize">{{ librarian.shift || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Hired</p>
            <p class="text-sm font-medium text-gray-700">{{ formatDate(librarian.hire_date) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  librarian: { type: Object, required: true },
})

const initials = computed(() => {
  const name = props.librarian.user?.name || ''
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

// Same avatar URL-building logic as MemberCard.vue / ProfileSettings.vue
const avatarUrl = computed(() => {
  if (!props.librarian.user?.avatar) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')
  return `${baseUrl}/storage/${props.librarian.user.avatar}`
})

const statusClass = computed(() => ({
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  on_leave: 'bg-amber-50 text-amber-700',
}[props.librarian.status] || 'bg-gray-100 text-gray-500'))

const statusDotClass = computed(() => ({
  active: 'bg-green-500',
  inactive: 'bg-gray-400',
  on_leave: 'bg-amber-500',
}[props.librarian.status] || 'bg-gray-400'))

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>