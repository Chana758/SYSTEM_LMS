<template>
  <div v-if="store.currentMember" class="space-y-6 pb-12">
    <!-- ============ HEADER SECTION ============ -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="font-serif text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p class="text-xs font-semibold text-slate-500 mt-0.5">Manage your library account information, checkouts, and preferences.</p>
      </div>
    </div>

    <div class="space-y-6">
      <MemberCard :member="store.currentMember" />

      <!-- Quick stats — self-service links, no edit rights here -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <router-link
          :to="{ name: 'my-borrows-page' }"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex items-center gap-4 hover:border-emerald-300 hover:shadow-md transition-all group"
        >
          <div class="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <ClockIcon class="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p class="text-sm font-black text-slate-900 tracking-tight">My Borrows</p>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">View active checkouts</p>
          </div>
        </router-link>

        <router-link
          :to="{ name: 'my-reservations' }"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <CalendarDaysIcon class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-sm font-black text-slate-900 tracking-tight">My Reservations</p>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">Track your queue position</p>
          </div>
        </router-link>

        <router-link
          to="/fines"
          class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 flex items-center gap-4 hover:border-rose-300 hover:shadow-md transition-all group"
        >
          <div class="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <BanknotesIcon class="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p class="text-sm font-black text-slate-900 tracking-tight">My Fines</p>
            <p class="text-xs font-semibold text-slate-400 mt-0.5">Check outstanding balance</p>
          </div>
        </router-link>
      </div>

      <!-- Contact Details Card -->
      <div class="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-2xs space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 class="font-serif text-lg font-black text-slate-900">Contact Details</h2>
            <p class="text-xs text-slate-500 mt-0.5">Your registered personal information on file.</p>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
            Verified Account
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Phone Number</p>
            <p class="text-slate-800 font-bold font-mono">{{ store.currentMember.user?.phone || '—' }}</p>
          </div>
          <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Identity Card No.</p>
            <p class="text-slate-800 font-bold font-mono">{{ store.currentMember.identity_card_no || '—' }}</p>
          </div>
          <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Emergency Contact</p>
            <p class="text-slate-800 font-bold font-mono">{{ store.currentMember.emergency_contact || '—' }}</p>
          </div>
          <div class="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            <p class="text-slate-400 text-[10px] font-black uppercase tracking-wider mb-1">Address</p>
            <p class="text-slate-800 font-bold">{{ store.currentMember.address || '—' }}</p>
          </div>
        </div>

        <div class="bg-amber-50/70 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
          <span class="text-base">💡</span>
          <p class="text-xs font-semibold text-amber-800 leading-relaxed">
            To update your contact details or personal credentials, please visit the library desk or contact an authorized librarian directly.
          </p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center py-20 text-slate-400">
    <div class="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
    <p class="text-xs font-bold uppercase tracking-wider text-slate-500">Loading your profile...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ClockIcon, CalendarDaysIcon, BanknotesIcon } from '@heroicons/vue/24/outline'
import { useMemberStore } from '../store/memberStore'
import MemberCard from '../components/MemberCard.vue'

const store = useMemberStore()

onMounted(() => store.fetchMyProfile())
</script>