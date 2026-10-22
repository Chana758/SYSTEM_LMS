<template>
  <div class="bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm p-6 transition-colors">
    <div v-if="!supported" class="text-center py-10">
      <div class="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-gray-300 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-600 dark:text-slate-200">{{ t('scanner.camera.notSupported') }}</p>
      <p class="text-xs text-gray-400 dark:text-slate-400 mt-1">{{ t('scanner.camera.switchToManual') }}</p>
    </div>

    <template v-else>
      <div class="relative rounded-2xl overflow-hidden bg-gray-900 dark:bg-slate-950 aspect-video">
        <video ref="videoRef" class="w-full h-full object-cover" muted playsinline autoplay></video>

        <div v-if="!isScanning" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <p class="text-xs text-white/70">{{ t('scanner.camera.cameraPreview') }}</p>
        </div>

        <div class="absolute inset-8 border-2 border-green-400/80 rounded-xl pointer-events-none">
          <span class="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-green-300 rounded-tl-lg"></span>
          <span class="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-green-300 rounded-tr-lg"></span>
          <span class="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-green-300 rounded-bl-lg"></span>
          <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-green-300 rounded-br-lg"></span>
        </div>

        <div v-if="isScanning" class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          <span class="text-xs text-white font-medium">{{ t('scanner.camera.scanning') }}</span>
        </div>

        <!-- Torch toggle: only rendered when the active camera supports it.
             iOS Safari never reports torch support, so it won't show there. -->
        <button
          v-if="isScanning && torchSupported"
          @click="toggleTorch"
          class="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur transition"
          :class="torchOn ? 'bg-amber-400 text-amber-950' : 'bg-black/50 text-white hover:bg-black/60'"
        >
          <BoltIcon class="w-3.5 h-3.5" />
          <span class="text-xs font-semibold">{{ torchOn ? t('scanner.camera.torchOn') : t('scanner.camera.torch') }}</span>
        </button>
      </div>

      <div class="flex justify-center mt-4">
        <button
          v-if="!isScanning"
          @click="start"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 hover:bg-green-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition cursor-pointer"
        >
          <PlayIcon class="w-4 h-4" />
          {{ t('scanner.camera.startCamera') }}
        </button>
        <button
          v-else
          @click="stop"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-rose-600 dark:hover:bg-rose-500 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition cursor-pointer"
        >
          <StopIcon class="w-4 h-4" />
          {{ t('scanner.camera.stopCamera') }}
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-600 dark:text-rose-300 bg-red-50 dark:bg-rose-500/10 border border-red-100 dark:border-rose-400/25 rounded-xl px-3.5 py-2.5 text-center mt-3">{{ error }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { PlayIcon, StopIcon, BoltIcon } from '@heroicons/vue/24/solid'
import { barcodeService } from '../services'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  // Keep the camera running after a detection (for multi-scan flows).
  continuous: { type: Boolean, default: false },
  // Start the camera as soon as the component mounts.
  autoStart: { type: Boolean, default: false },
  // Ignore the same code if seen again within this many ms (continuous mode).
  dedupeMs: { type: Number, default: 2000 },
})

const emit = defineEmits(['detected'])

const supported = barcodeService.isSupported()
const videoRef = ref(null)
const isScanning = ref(false)
const error = ref('')
const torchSupported = ref(false)
const torchOn = ref(false)

let stream = null
let reader = null
let decodingControls = null
let lastCode = ''
let lastAt = 0

const CAMERA_ERROR_MESSAGES = {
  NotAllowedError: () => t('scanner.cameraErrors.permissionDenied'),
  PermissionDeniedError: () => t('scanner.cameraErrors.permissionDenied'),
  NotFoundError: () => t('scanner.cameraErrors.noCameraFound'),
  DevicesNotFoundError: () => t('scanner.cameraErrors.noCameraFound'),
  NotReadableError: () => t('scanner.cameraErrors.inUse'),
  TrackStartError: () => t('scanner.cameraErrors.inUse'),
  OverconstrainedError: () => t('scanner.cameraErrors.overconstrained'),
  SecurityError: () => t('scanner.cameraErrors.security'),
  InsecureContextError: () => t('scanner.cameraErrors.insecureContext'),
  NotSupportedError: () => t('scanner.cameraErrors.notSupported'),
  AbortError: () => t('scanner.cameraErrors.aborted'),
}

const describeCameraError = (e) =>
  (CAMERA_ERROR_MESSAGES[e?.name]?.()) || t('scanner.cameraErrors.generic')

const start = async () => {
  if (isScanning.value) return
  error.value = ''
  lastCode = ''
  lastAt = 0
  try {
    stream = await barcodeService.startCamera(videoRef.value)
    isScanning.value = true
    torchSupported.value = barcodeService.hasTorch(stream)
    torchOn.value = false
    reader = barcodeService.createReader()
    decodingControls = await barcodeService.startDecoding(reader, videoRef.value, (barcode) => {
      if (props.continuous) {
        const now = Date.now()
        if (barcode === lastCode && now - lastAt < props.dedupeMs) return
        lastCode = barcode
        lastAt = now
        emit('detected', barcode)
      } else {
        emit('detected', barcode)
        stop()
      }
    })
  } catch (e) {
    console.error('Camera start failed:', e?.name, e?.message, e)
    // Make sure a half-started camera doesn't stay on.
    barcodeService.stopCamera(stream)
    stream = null
    isScanning.value = false
    error.value = describeCameraError(e)
  }
}

const toggleTorch = async () => {
  const ok = await barcodeService.setTorch(stream, !torchOn.value)
  if (ok) torchOn.value = !torchOn.value
}

const stop = () => {
  decodingControls?.stop()
  decodingControls = null
  reader = null
  barcodeService.stopCamera(stream)
  stream = null
  isScanning.value = false
  torchSupported.value = false
  torchOn.value = false
}

onMounted(() => {
  if (props.autoStart && supported) start()
})
onBeforeUnmount(stop)

defineExpose({ start, stop })
</script>