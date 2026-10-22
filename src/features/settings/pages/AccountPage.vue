<template>
  <SettingsLayout>
    <SettingsCard>
      <AccountSettings class="w-full" />
    </SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import AccountSettings from '@/features/settings/components/AccountSettings.vue'
</script>