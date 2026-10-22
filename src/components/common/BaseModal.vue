<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        @click.self="close"
      >
        <div
          role="dialog"
          aria-modal="true"
          class="bg-white dark:bg-slate-800 rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-300 dark:border-white/10 p-6 sm:p-8 space-y-4 text-slate-900 dark:text-white"
          :class="sizeClass"
        >
          <div v-if="title || $slots.header" class="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <slot name="header">
              <div>
                <h2 class="font-serif text-lg font-black text-slate-900 dark:text-white">{{ title }}</h2>
                <p v-if="subtitle" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{{ subtitle }}</p>
              </div>
            </slot>
            <button type="button" class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-bold cursor-pointer" @click="close">✕</button>
          </div>

          <slot />

          <div v-if="$slots.footer" class="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-white/10">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: String, default: 'lg' }, // sm | md | lg | xl
})
const emit = defineEmits(['update:modelValue', 'close'])

const sizeClass = computed(() => ({
  sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl',
}[props.size] || 'max-w-2xl'))

function close() {
  emit('update:modelValue', false)
  emit('close')
}
function onKey(e) { if (e.key === 'Escape') close() }

watch(() => props.modelValue, (open) => {
  if (open) window.addEventListener('keydown', onKey)
  else window.removeEventListener('keydown', onKey)
}, { immediate: true })

onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .15s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
</style>