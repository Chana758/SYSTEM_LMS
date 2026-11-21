<template>
  <AppWrapper>
    <router-view />
    <IdleLock />
  </AppWrapper>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'vue-toastification'
import AppWrapper from '@/components/layout/AppWrapper.vue'
import IdleLock from '@/components/IdleLock.vue'

const toast = useToast()
const { t } = useI18n()

// Show a warning when the backend blocks a write for the demo account
function onDemoRestricted(event) {
  toast.warning(event.detail || t('common.demo.restricted'))
}

onMounted(() => window.addEventListener('demo-restricted', onDemoRestricted))
onBeforeUnmount(() => window.removeEventListener('demo-restricted', onDemoRestricted))
</script>