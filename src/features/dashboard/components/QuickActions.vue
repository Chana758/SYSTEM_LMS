<template>
  <div class="bg-white rounded-2xl border border-slate-300 shadow-sm p-6 space-y-5">
    <div>
      <h3 class="text-base font-black text-slate-900 tracking-tight">{{ $t('dashboard.quickActions.title') }}</h3>
      <p class="text-xs font-semibold text-slate-500 mt-0.5">{{ $t('dashboard.quickActions.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Action 1: New Borrow (Teal) -->
      <component
        :is="actions[0].to ? 'router-link' : 'button'"
        :to="actions[0].to"
        style="background-color: #0d9488; border-color: #0f766e;"
        class="rounded-2xl border shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md group cursor-pointer text-left text-white"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <ArrowsRightLeftIcon class="w-5 h-5" />
          </div>
          <span style="background-color: rgba(15, 118, 110, 0.6);" class="text-[10px] font-extrabold text-teal-100 uppercase tracking-widest px-2.5 py-1 rounded-full border border-teal-300/30">Action</span>
        </div>
        <div>
          <p class="text-sm font-black text-white tracking-tight mb-0.5">{{ $t('dashboard.quickActions.newBorrow') }}</p>
          <p class="text-[11px] font-bold text-teal-100 tracking-wide">{{ $t('dashboard.quickActions.newBorrowDesc') }}</p>
        </div>
      </component>

      <!-- Action 2: New Reservation (Rose) -->
      <component
        :is="actions[1].to ? 'router-link' : 'button'"
        :to="actions[1].to"
        style="background-color: #e11d48; border-color: #be123c;"
        class="rounded-2xl border shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md group cursor-pointer text-left text-white"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <CalendarDaysIcon class="w-5 h-5" />
          </div>
          <span style="background-color: rgba(190, 18, 60, 0.6);" class="text-[10px] font-extrabold text-rose-100 uppercase tracking-widest px-2.5 py-1 rounded-full border border-rose-300/30">Reserve</span>
        </div>
        <div>
          <p class="text-sm font-black text-white tracking-tight mb-0.5">{{ $t('dashboard.quickActions.newReservation') }}</p>
          <p class="text-[11px] font-bold text-rose-100 tracking-wide">{{ $t('dashboard.quickActions.newReservationDesc') }}</p>
        </div>
      </component>

      <!-- Action 3: Add Member (Indigo) -->
      <component
        :is="actions[2].to ? 'router-link' : 'button'"
        :to="actions[2].to"
        style="background-color: #4f46e5; border-color: #4338ca;"
        class="rounded-2xl border shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md group cursor-pointer text-left text-white"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <UserPlusIcon class="w-5 h-5" />
          </div>
          <span style="background-color: rgba(67, 56, 202, 0.6);" class="text-[10px] font-extrabold text-indigo-100 uppercase tracking-widest px-2.5 py-1 rounded-full border border-indigo-300/30">Member</span>
        </div>
        <div>
          <p class="text-sm font-black text-white tracking-tight mb-0.5">{{ $t('dashboard.quickActions.addMember') }}</p>
          <p class="text-[11px] font-bold text-indigo-100 tracking-wide">{{ $t('dashboard.quickActions.addMemberDesc') }}</p>
        </div>
      </component>

      <!-- Action 4: Scan Barcode (Sky Blue) -->
      <component
        :is="actions[3].to ? 'router-link' : 'button'"
        :to="actions[3].to"
        style="background-color: #0284c7; border-color: #0369a1;"
        class="rounded-2xl border shadow-sm p-5 flex flex-col justify-between transition-all hover:shadow-md group cursor-pointer text-left text-white"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <QrCodeIcon class="w-5 h-5" />
          </div>
          <span style="background-color: rgba(3, 105, 161, 0.6);" class="text-[10px] font-extrabold text-sky-100 uppercase tracking-widest px-2.5 py-1 rounded-full border border-sky-300/30">Scan</span>
        </div>
        <div>
          <p class="text-sm font-black text-white tracking-tight mb-0.5">{{ $t('dashboard.quickActions.scanBarcode') }}</p>
          <p class="text-[11px] font-bold text-sky-100 tracking-wide">{{ $t('dashboard.quickActions.scanBarcodeDesc') }}</p>
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