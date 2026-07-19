<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-6">
    <div class="flex items-start gap-5">
      <!-- FIX: show the real uploaded avatar (same source the Navbar/Header
           uses) when one exists, falling back to the initials circle only
           when the member has no avatar set. Previously this always
           rendered initials regardless of whether an avatar existed. -->
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
            <h2 class="text-lg font-bold text-gray-900">{{ member.user?.name }}</h2>
            <p class="text-sm text-gray-500">{{ member.user?.email }}</p>
          </div>
          <MembershipBadge :type="member.membership_type" :status="member.status" />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Membership No.</p>
            <p class="text-sm font-medium text-gray-700">{{ member.membership_no }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Phone</p>
            <p class="text-sm font-medium text-gray-700">{{ member.user?.phone || '—' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Borrow Limit</p>
            <p class="text-sm font-medium text-gray-700">{{ member.max_borrow_limit }} books</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Joined</p>
            <p class="text-sm font-medium text-gray-700">{{ formatDate(member.created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MembershipBadge from './MembershipBadge.vue'

const props = defineProps({
  member: { type: Object, required: true },
})

const initials = computed(() => {
  const name = props.member.user?.name || ''
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

// FIX: same URL-building logic as ProfileSettings.vue's `previewUrl`
// computed — backend only returns a relative path like
// "avatars/example.jpg", so it needs to be prefixed with the API's
// storage base URL to become a loadable <img src>.
const avatarUrl = computed(() => {
  if (!props.member.user?.avatar) {
    return null
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL.replace('/api', '')

  return `${baseUrl}/storage/${props.member.user.avatar}`
})

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>