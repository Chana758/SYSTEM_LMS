<template>
  <SettingsLayout>
    <SettingsCard>
      <PreferenceSettings class="w-full" />
    </SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import PreferenceSettings from '@/features/settings/components/PreferenceSettings.vue'
</script>