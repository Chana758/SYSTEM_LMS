<template>
  <SettingsLayout>
    <SettingsCard>
      <ProfileSettings class="w-full" />
    </SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import ProfileSettings from '@/features/settings/components/ProfileSettings.vue'
</script>