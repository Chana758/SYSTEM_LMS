<template>
  <div class="bg-gray-900 rounded-2xl overflow-hidden" style="height: 75vh;">
    <iframe
      v-if="fileUrl"
      :src="fileUrl"
      class="w-full h-full border-0"
      title="PDF Viewer"
    ></iframe>
    <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
      No file available to preview.
    </div>
  </div>
</template>

<script setup>
defineProps({ fileUrl: { type: String, default: '' } })
</script>