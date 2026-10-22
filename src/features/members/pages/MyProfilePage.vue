<template>
  <!--
    Member page = web app.
    Phones : compact, thumb-friendly list rows. Extra bottom padding so the last item
             is never hidden behind the fixed bottom nav (64px + safe area).
    sm+    : 3-card grid.
  -->
  <div v-if="store.currentMember" class="space-y-5 sm:space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] lg:pb-12">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{{ t('members.myProfile.title') }}</h1>
        <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('members.myProfile.subtitle') }}</p>
      </div>
    </div>

    <div class="space-y-5 sm:space-y-6">
      <MemberCard :member="store.currentMember" />

      <!-- Quick actions: one row each on phones, vertical cards from sm -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <router-link
          v-for="a in actions"
          :key="a.key"
          :to="a.to"
          class="group flex items-center gap-3.5 p-3.5 rounded-2xl sm:rounded-xl bg-white dark:bg-slate-800/50 border border-slate-200/90 dark:border-white/10 shadow-2xs
                 transition-all active:scale-[0.99] hover:shadow-md cursor-pointer
                 sm:flex-col sm:items-stretch sm:justify-between sm:gap-0 sm:p-4"
          :class="a.hoverBorder"
        >
          <div class="flex items-center justify-between sm:mb-4 sm:w-full">
            <div class="w-11 h-11 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg flex items-center justify-center sm:group-hover:scale-105 transition-transform" :class="a.iconBox">
              <component :is="a.icon" class="w-6 h-6 sm:w-5 sm:h-5" :class="a.iconColor" />
            </div>
            <span class="hidden sm:inline text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors" :class="a.chipHover">{{ a.chip }}</span>
          </div>

          <div class="flex-1 min-w-0 sm:flex-none">
            <p class="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-none mb-0.5 sm:mb-1 truncate">{{ a.title }}</p>
            <p class="text-[11px] font-bold tracking-wide truncate" :class="a.subColor">{{ a.subtitle }}</p>
          </div>

          <ChevronRightIcon class="w-5 h-5 text-slate-300 dark:text-slate-600 flex-shrink-0 sm:hidden" />
        </router-link>
      </div>

      <!-- Contact Details Card -->
      <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 sm:p-6 md:p-8 shadow-2xs space-y-5 sm:space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-white/10">
          <div class="min-w-0">
            <h2 class="text-lg font-black text-slate-900 dark:text-white tracking-tight">{{ t('members.myProfile.contactDetails') }}</h2>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{{ t('members.myProfile.contactDetailsSubtitle') }}</p>
          </div>
          <span class="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-500/20">
            {{ t('members.myProfile.verifiedAccount') }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 text-sm">
          <div class="bg-slate-50/70 dark:bg-slate-900/50 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
            <p class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.phoneNumber') }}</p>
            <p class="text-slate-900 dark:text-white font-bold font-mono text-sm break-words">{{ store.currentMember.user?.phone || '—' }}</p>
          </div>
          <div class="bg-slate-50/70 dark:bg-slate-900/50 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
            <p class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.identityCardNo') }}</p>
            <p class="text-slate-900 dark:text-white font-bold font-mono text-sm break-words">{{ store.currentMember.identity_card_no || '—' }}</p>
          </div>
          <div class="bg-slate-50/70 dark:bg-slate-900/50 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
            <p class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.emergencyContact') }}</p>
            <p class="text-slate-900 dark:text-white font-bold font-mono text-sm break-words">{{ store.currentMember.emergency_contact || '—' }}</p>
          </div>
          <div class="bg-slate-50/70 dark:bg-slate-900/50 p-3.5 sm:p-4 rounded-xl border border-slate-200/60 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-colors">
            <p class="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.address') }}</p>
            <p class="text-slate-900 dark:text-white font-bold text-sm break-words">{{ store.currentMember.address || '—' }}</p>
          </div>
        </div>

        <div class="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-500/20 rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
          <div class="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-sm">💡</span>
          </div>
          <p class="text-xs font-semibold text-amber-900 dark:text-amber-200 leading-relaxed">
            {{ t('members.myProfile.contactAdminHint') }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20 text-slate-400 dark:text-slate-500">
    <div class="w-8 h-8 border-3 border-emerald-600 dark:border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{{ t('members.myProfile.loading') }}</p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClockIcon, CalendarDaysIcon, BanknotesIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberCard from '../components/MemberCard.vue'

const { t } = useI18n()
const store = useMemberStore()

// Class names are written out in full so Tailwind can detect them.
// NOTE: chip labels now go through t() with an English fallback.
// Add these keys to your locale files (en + km):
//   members.myProfile.chipActive / chipQueue / chipBalance
// NOTE: if you have a named route for fines (e.g. 'my-fines'), replace the path below with { name: 'my-fines' }.
const actions = computed(() => [
  {
    key: 'borrows',
    to: { name: 'my-borrows-page' },
    icon: ClockIcon,
    chip: t('members.myProfile.chipActive', 'Active'),
    title: t('members.myProfile.myBorrows'),
    subtitle: t('members.myProfile.viewActiveCheckouts'),
    iconBox: 'bg-emerald-50 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-700 dark:text-emerald-400',
    subColor: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-300 dark:hover:border-emerald-500/40',
    chipHover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
  },
  {
    key: 'reservations',
    to: { name: 'my-reservations' },
    icon: CalendarDaysIcon,
    chip: t('members.myProfile.chipQueue', 'Queue'),
    title: t('members.myProfile.myReservations'),
    subtitle: t('members.myProfile.trackQueue'),
    iconBox: 'bg-blue-50 dark:bg-blue-500/15',
    iconColor: 'text-blue-600 dark:text-blue-400',
    subColor: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-500/40',
    chipHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
  },
  {
    key: 'fines',
    to: '/my-fines',
    icon: BanknotesIcon,
    chip: t('members.myProfile.chipBalance', 'Balance'),
    title: t('members.myProfile.myFines'),
    subtitle: t('members.myProfile.checkBalance'),
    iconBox: 'bg-rose-50 dark:bg-rose-500/15',
    iconColor: 'text-rose-500 dark:text-rose-400',
    subColor: 'text-rose-500 dark:text-rose-400',
    hoverBorder: 'hover:border-rose-300 dark:hover:border-rose-500/40',
    chipHover: 'group-hover:text-rose-500 dark:group-hover:text-rose-400',
  },
])

onMounted(() => store.fetchMyProfile())
</script>