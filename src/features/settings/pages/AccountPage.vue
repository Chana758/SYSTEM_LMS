<template>
  <div class="space-y-6 pb-12">
    <div class="bg-white rounded-2xl border-2 border-slate-300 p-6 shadow-lg flex items-center gap-4">
      <div class="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center text-xl shadow-2xs flex-shrink-0">
        👤
      </div>
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p class="text-xs font-bold text-slate-500 mt-0.5">Manage your profile, account, and system preferences.</p>
      </div>
    </div>

    <div class="flex flex-col lg:flex-row gap-6 items-start">
      <div class="w-full lg:w-72 flex-shrink-0">
        <SettingsNav />
      </div>
      <div class="w-full flex-1 bg-white rounded-2xl border-2 border-slate-300 p-6 md:p-8 shadow-lg border-dashed">
        <AccountSettings class="w-full" />
      </div>
    </div>
  </div>
</template>

<script setup>
import SettingsNav from '@/features/settings/components/SettingsNav.vue'
import AccountSettings from '@/features/settings/components/AccountSettings.vue'
</script>