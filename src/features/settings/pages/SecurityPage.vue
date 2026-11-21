<template>
  <SettingsLayout>
    <SettingsCard><SecuritySettings class="w-full" /></SettingsCard>
    <SettingsCard><QrLoginCard class="w-full" /></SettingsCard>
    <SettingsCard><MyLoginActivity class="w-full" /></SettingsCard>
    <SettingsCard><LogoutAllCard class="w-full" /></SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import SecuritySettings from '@/features/settings/components/SecuritySettings.vue'
import QrLoginCard from '@/features/settings/components/QrLoginCard.vue'
import LogoutAllCard from '@/features/settings/components/LogoutAllCard.vue'
import MyLoginActivity from '@/features/visits/components/MyLoginActivity.vue'
</script>