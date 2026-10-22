<template>
  <SettingsLayout>
    <SettingsCard><BrandingSettings class="w-full" /></SettingsCard>
    <SettingsCard><SystemSettings class="w-full" /></SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import BrandingSettings from '@/features/settings/components/BrandingSettings.vue'
import SystemSettings from '@/features/settings/components/SystemSettings.vue'
</script>