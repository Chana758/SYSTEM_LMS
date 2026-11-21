<template>
  <SettingsLayout>
    <SettingsCard><BrandingSettings class="w-full" /></SettingsCard>
    <SettingsCard v-if="authStore.role === 'admin'"><AuthSettings class="w-full" /></SettingsCard>
    <SettingsCard v-if="authStore.role === 'admin'"><CurrencySettings class="w-full" /></SettingsCard>
  </SettingsLayout>
</template>

<script setup>
import SettingsLayout from '@/features/settings/components/Settingslayout.vue'
import SettingsCard from '@/features/settings/components/SettingsCard.vue'
import BrandingSettings from '@/features/settings/components/BrandingSettings.vue'
import AuthSettings from '@/features/settings/components/AuthSettings.vue'
import CurrencySettings from '@/features/settings/components/CurrencySettings.vue'
import { useAuthStore } from '@/features/auth/store/authStore'

const authStore = useAuthStore()
</script>