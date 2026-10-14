<template>
  <footer class="px-6 py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
    © {{ year }} SMART NEXUS · Smart System LMS
  </footer>
</template>

<script setup>
const year = new Date().getFullYear()
</script>