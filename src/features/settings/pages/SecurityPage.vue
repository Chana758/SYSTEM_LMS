<template>
  <SettingsLayout>
    <SettingsCard><SecuritySettings class="w-full" /></SettingsCard>
    <SettingsCard><QrLoginCard class="w-full" /></SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import SecuritySettings from '@/features/settings/components/SecuritySettings.vue'
import QrLoginCard from '@/features/settings/components/QrLoginCard.vue'
</script>