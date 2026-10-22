<template>
  <div class="p-6 flex items-center justify-center py-24 text-slate-400 dark:text-slate-500 font-bold text-xs uppercase tracking-widest">
    Redirecting to the full Fine Report...
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  router.replace('/reports/fine')
})
</script>