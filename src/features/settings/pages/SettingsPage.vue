<template>
  <div class="p-6 flex items-center justify-center py-24 text-slate-400 font-bold text-xs uppercase tracking-widest">
    Redirecting to settings...
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace({ path: '/settings/profile' })
})
</script>