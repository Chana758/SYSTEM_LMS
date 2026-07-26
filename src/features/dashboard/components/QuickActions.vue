<template>
  <div class="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-5">
    <div>
      <h3 class="text-base font-black text-slate-900 tracking-tight">Quick Actions</h3>
      <p class="text-xs font-semibold text-slate-500 mt-0.5">Jump straight into common daily tasks.</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Action 1: New Borrow (Emerald) -->
      <component
        :is="actions[0].to ? 'router-link' : 'button'"
        :to="actions[0].to"
        class="bg-gradient-to-br from-emerald-50/70 via-white to-white rounded-2xl border border-emerald-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-300 group cursor-pointer text-left"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ArrowsRightLeftIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">Action</span>
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 tracking-tight mb-0.5">New Borrow</p>
          <p class="text-[11px] font-bold text-emerald-700 tracking-wide">Issue a book loan</p>
        </div>
      </component>

      <!-- Action 2: New Reservation (Blue) -->
      <component
        :is="actions[1].to ? 'router-link' : 'button'"
        :to="actions[1].to"
        class="bg-gradient-to-br from-blue-50/70 via-white to-white rounded-2xl border border-blue-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-300 group cursor-pointer text-left"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <CalendarDaysIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full">Reserve</span>
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 tracking-tight mb-0.5">New Reservation</p>
          <p class="text-[11px] font-bold text-blue-700 tracking-wide">Hold a book copy</p>
        </div>
      </component>

      <!-- Action 3: Add Member (Amber) -->
      <component
        :is="actions[2].to ? 'router-link' : 'button'"
        :to="actions[2].to"
        class="bg-gradient-to-br from-amber-50/70 via-white to-white rounded-2xl border border-amber-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-amber-300 group cursor-pointer text-left"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <UserPlusIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold text-amber-700 uppercase tracking-widest bg-amber-50 px-2.5 py-1 rounded-full">Member</span>
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 tracking-tight mb-0.5">Add Member</p>
          <p class="text-[11px] font-bold text-amber-700 tracking-wide">Register new user</p>
        </div>
      </component>

      <!-- Action 4: Scan Barcode (Purple) -->
      <component
        :is="actions[3].to ? 'router-link' : 'button'"
        :to="actions[3].to"
        class="bg-gradient-to-br from-purple-50/70 via-white to-white rounded-2xl border border-purple-200 shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md hover:border-purple-300 group cursor-pointer text-left"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <QrCodeIcon class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-extrabold text-purple-700 uppercase tracking-widest bg-purple-50 px-2.5 py-1 rounded-full">Scan</span>
        </div>
        <div>
          <p class="text-sm font-black text-slate-900 tracking-tight mb-0.5">Scan Barcode</p>
          <p class="text-[11px] font-bold text-purple-700 tracking-wide">Quick lookup & audit</p>
        </div>
      </component>

    </div>
  </div>
</template>

<script setup>
import {
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  QrCodeIcon,
} from '@heroicons/vue/24/outline'

const actions = [
  {
    label: 'New Borrow',
    to: '/scanner',
    icon: ArrowsRightLeftIcon,
  },
  {
    label: 'New Reservation',
    to: { name: 'reservation-create' },
    icon: CalendarDaysIcon,
  },
  {
    label: 'Add Member',
    to: { name: 'member-list' },
    icon: UserPlusIcon,
  },
  {
    label: 'Scan Barcode',
    to: '/scanner',
    icon: QrCodeIcon,
  },
]
</script>