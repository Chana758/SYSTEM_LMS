<template>
  <div class="p-6 flex items-center justify-center py-24 text-gray-400 text-sm">Redirecting...</div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace({ path: '/settings/profile' })
})
</script>