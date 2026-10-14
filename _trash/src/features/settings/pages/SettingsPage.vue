<template>
  <div class="p-6 flex items-center justify-center py-24 text-slate-400 font-bold text-xs uppercase tracking-widest">
    {{ t('settings.redirecting') }}
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const { t } = useI18n()

onMounted(() => {
  router.replace({ path: '/settings/profile' })
})
</script>