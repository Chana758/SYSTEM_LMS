<template>
  <div v-if="store.currentMember" class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ t('members.myProfile.title') }}</h1>
        <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ t('members.myProfile.subtitle') }}</p>
      </div>
    </div>

    <div class="space-y-6">
      <MemberCard :member="store.currentMember" />

      <!-- Quick stats — vertical layout matching the dashboard stat cards style -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- My Borrows -->
        <router-link
          :to="{ name: 'my-borrows-page' }"
          class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300 group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ClockIcon class="w-5 h-5 text-emerald-700" />
            </div>
            <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 transition-colors">Active</span>
          </div>
          <div>
            <p class="text-base font-black text-slate-900 tracking-tight leading-none mb-1">{{ t('members.myProfile.myBorrows') }}</p>
            <p class="text-[11px] font-bold text-emerald-600 tracking-wide">{{ t('members.myProfile.viewActiveCheckouts') }}</p>
          </div>
        </router-link>

        <!-- My Reservations -->
        <router-link
          :to="{ name: 'my-reservations' }"
          class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-300 group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CalendarDaysIcon class="w-5 h-5 text-blue-600" />
            </div>
            <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Queue</span>
          </div>
          <div>
            <p class="text-base font-black text-slate-900 tracking-tight leading-none mb-1">{{ t('members.myProfile.myReservations') }}</p>
            <p class="text-[11px] font-bold text-blue-600 tracking-wide">{{ t('members.myProfile.trackQueue') }}</p>
          </div>
        </router-link>

        <!-- My Fines -->
        <router-link
          to="/my-fines"
          class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 flex flex-col justify-between transition-all hover:shadow-md hover:border-rose-300 group cursor-pointer"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BanknotesIcon class="w-5 h-5 text-rose-500" />
            </div>
            <span class="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest group-hover:text-rose-500 transition-colors">Balance</span>
          </div>
          <div>
            <p class="text-base font-black text-slate-900 tracking-tight leading-none mb-1">{{ t('members.myProfile.myFines') }}</p>
            <p class="text-[11px] font-bold text-rose-500 tracking-wide">{{ t('members.myProfile.checkBalance') }}</p>
          </div>
        </router-link>
      </div>

      <!-- Contact Details Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 class="text-lg font-black text-slate-900 tracking-tight">{{ t('members.myProfile.contactDetails') }}</h2>
            <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ t('members.myProfile.contactDetailsSubtitle') }}</p>
          </div>
          <span class="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider border border-emerald-200/60">
            {{ t('members.myProfile.verifiedAccount') }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-colors">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.phoneNumber') }}</p>
            <p class="text-slate-900 font-bold font-mono text-sm">{{ store.currentMember.user?.phone || '—' }}</p>
          </div>
          <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-colors">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.identityCardNo') }}</p>
            <p class="text-slate-900 font-bold font-mono text-sm">{{ store.currentMember.identity_card_no || '—' }}</p>
          </div>
          <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-colors">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.emergencyContact') }}</p>
            <p class="text-slate-900 font-bold font-mono text-sm">{{ store.currentMember.emergency_contact || '—' }}</p>
          </div>
          <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-colors">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">{{ t('members.myProfile.address') }}</p>
            <p class="text-slate-900 font-bold text-sm">{{ store.currentMember.address || '—' }}</p>
          </div>
        </div>

        <div class="bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3.5 shadow-2xs">
          <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span class="text-sm">💡</span>
          </div>
          <p class="text-xs font-semibold text-amber-900 leading-relaxed">
            {{ t('members.myProfile.contactAdminHint') }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20 text-slate-400">
    <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500">{{ t('members.myProfile.loading') }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ClockIcon, CalendarDaysIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberCard from '../components/MemberCard.vue'

const { t } = useI18n()
const store = useMemberStore()

onMounted(() => store.fetchMyProfile())
</script>