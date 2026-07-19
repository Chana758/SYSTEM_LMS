<template>
  <div class="p-6">
    <h1 class="text-xl font-bold text-gray-800 mb-6">Settings</h1>
    <SettingsMenu />
    <div class="flex gap-6">
      <SettingsNav />
      <div class="flex-1"><SecuritySettings /></div>
    </div>
  </div>
</template>

<script setup>
import SettingsNav from '@/features/settings/components/SettingsNav.vue'
import SettingsMenu from '@/features/settings/components/SettingsMenu.vue'
import SecuritySettings from '@/features/settings/components/SecuritySettings.vue'
</script>