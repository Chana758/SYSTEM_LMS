<template>
  <SettingsLayout>
    <SettingsCard>
      <BackupSettings class="w-full" />
    </SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import BackupSettings from '@/features/settings/components/BackupSettings.vue'
</script>