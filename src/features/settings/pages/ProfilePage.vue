<template>
  <div class="p-6">
    <!-- Header card -->
    <div class="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 mb-6">
      <div class="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
        <UserCircleIcon class="w-6 h-6 text-green-700" />
      </div>
      <div>
        <h1 class="text-xl font-bold text-gray-800">Settings</h1>
        <p class="text-sm text-gray-400 mt-0.5">Manage your profile, account, and system preferences.</p>
      </div>
    </div>

    <SettingsMenu />
    <div class="flex gap-6">
      <SettingsNav />
      <div class="flex-1"><ProfileSettings /></div>
    </div>
  </div>
</template>

<script setup>
import { UserCircleIcon } from '@heroicons/vue/24/outline'
import SettingsNav from '@/features/settings/components/SettingsNav.vue'
import SettingsMenu from '@/features/settings/components/SettingsMenu.vue'
import ProfileSettings from '@/features/settings/components/ProfileSettings.vue'
</script>