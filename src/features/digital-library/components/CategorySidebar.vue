<template>
  <div class="bg-white rounded-2xl border border-gray-200 p-4">
    <h3 class="text-xs uppercase tracking-wide text-gray-400 font-bold mb-3 px-1">Categories</h3>
    <nav class="space-y-1">
      <button
        @click="$emit('select', '')"
        class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors"
        :class="!activeId ? 'bg-green-700 text-white font-medium' : 'text-gray-600 hover:bg-gray-50'"
      >
        All Categories
      </button>
      <button
        v-for="c in categories" :key="c.id"
        @click="$emit('select', c.id)"
        class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between"
        :class="activeId === c.id ? 'bg-green-700 text-white font-medium' : 'text-gray-600 hover:bg-gray-50'"
      >
        <span>{{ c.name }}</span>
        <span
          v-if="c.books_count !== undefined"
          class="text-xs px-1.5 rounded-full"
          :class="activeId === c.id ? 'bg-white/20' : 'bg-gray-100 text-gray-400'"
        >
          {{ c.books_count }}
        </span>
      </button>
    </nav>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, default: () => [] },
  activeId: { type: [Number, String], default: '' },
})
defineEmits(['select'])
</script>