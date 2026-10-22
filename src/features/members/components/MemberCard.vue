<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-white/10 p-4 sm:p-6 shadow-sm">
    <div class="flex items-start gap-3.5 sm:gap-5">
      <img
        v-if="avatarUrl"
        :src="avatarUrl"
        alt="Profile avatar"
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border border-slate-200 dark:border-white/10 flex-shrink-0"
      />
      <div
        v-else
        class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white text-lg sm:text-xl font-bold flex items-center justify-center flex-shrink-0 shadow-sm"
      >
        {{ initials }}
      </div>

      <div class="flex-1 min-w-0">
        <!-- Phones: badges drop below the name. sm+: badges sit on the right. -->
        <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
          <div class="min-w-0">
            <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">{{ member.user?.name }}</h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{{ member.user?.email }}</p>
          </div>
          <MembershipBadge :type="member.membership_type" :status="member.status" class="flex-wrap" />
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-3.5 sm:gap-4 mt-4 sm:mt-5 pt-4 border-t border-slate-100 dark:border-white/10">
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ t('members.membershipNo') }}</p>
        <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 font-mono break-all">{{ member.membership_no }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ t('members.card.phone') }}</p>
        <p class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 break-words">{{ member.user?.phone || '—' }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ t('members.card.borrowLimit') }}</p>
        <p class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{{ member.max_borrow_limit }} {{ t('members.card.books') }}</p>
      </div>
      <div class="min-w-0">
        <p class="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider mb-0.5">{{ t('members.card.joined') }}</p>
        <p class="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">{{ formatDate(member.created_at) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MembershipBadge from './MembershipBadge.vue'

const { t } = useI18n()

const props = defineProps({
  member: { type: Object, required: true },
})

const initials = computed(() => {
  const name = props.member.user?.name || ''
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?'
})

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