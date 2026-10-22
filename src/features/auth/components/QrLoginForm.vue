<template>
  <div class="space-y-4">
    <!-- Camera -->
    <div
      v-if="supported && !cameraError"
      class="relative mx-auto w-full max-w-xs aspect-square rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shadow-md"
    >
      <video ref="videoRef" class="w-full h-full object-cover" muted playsinline autoplay></video>

      <!-- starting overlay -->
      <div v-if="!scanning" class="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-300 text-xs font-bold animate-pulse">
        {{ $t('auth.qrStartingCamera') }}
      </div>

      <!-- scan frame -->
      <div class="absolute inset-8 pointer-events-none">
        <span class="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-amber-400 rounded-tl-xl"></span>
        <span class="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-amber-400 rounded-tr-xl"></span>
        <span class="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-amber-400 rounded-bl-xl"></span>
        <span class="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-amber-400 rounded-br-xl"></span>

        <!-- moving scan line -->
        <span
          v-if="scanning && !loading"
          class="scan-line absolute left-1 right-1 h-0.5 rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.7)]"
        ></span>
      </div>

      <!-- status pill -->
      <div
        v-if="scanning"
        class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/55 backdrop-blur px-2.5 py-1 rounded-full"
      >
        <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="loading ? 'bg-amber-400' : 'bg-emerald-400'"></span>
        <span class="text-[11px] text-white font-bold">
          {{ loading ? $t('auth.qrVerifying') : $t('auth.qrScanning') }}
        </span>
      </div>
    </div>

    <!-- Camera unavailable / denied -->
    <div
      v-else
      class="rounded-2xl bg-amber-50 border-2 border-amber-200 p-5 text-center space-y-3"
    >
      <div class="w-11 h-11 mx-auto rounded-xl bg-amber-100 flex items-center justify-center">
        <VideoCameraSlashIcon class="w-6 h-6 text-amber-600" />
      </div>
      <p class="text-xs font-semibold text-amber-800 leading-relaxed">
        {{ cameraError || $t('auth.qrUnsupported') }}
      </p>
      <button
        v-if="supported"
        type="button"
        @click="retry"
        class="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#17664b] hover:bg-[#0f5139] text-white text-xs font-bold transition-all cursor-pointer"
      >
        <ArrowPathIcon class="w-4 h-4" />
        {{ $t('auth.qrRetry') }}
      </button>
    </div>

    <p class="text-[11px] font-semibold text-slate-400 text-center">
      {{ $t('auth.qrHint') }}
    </p>

    <!-- Messages -->
    <p
      v-if="loading"
      class="text-xs font-semibold text-[#17664b] bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5 text-center"
    >
      {{ $t('auth.qrVerifying') }}
    </p>
    <p
      v-else-if="errors.general"
      class="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5 text-center"
    >
      {{ errors.general }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { BrowserQRCodeReader } from '@zxing/browser'
import { VideoCameraSlashIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

const props = defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['submit'])

const videoRef = ref(null)
const scanning = ref(false)
const cameraError = ref('')

// ZXing decodes frames itself, so the only requirement is camera access
// (works on iPhone too — BarcodeDetector is Chrome-only).
const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

let stream = null
let reader = null
let decodingControls = null
let locked = false
let unmounted = false

async function start() {
  if (!supported) return
  cameraError.value = ''
  try {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      throw Object.assign(new Error('Insecure context'), { name: 'InsecureContextError' })
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
    })

    // Component was closed (tab switched) while the permission prompt was open.
    if (unmounted || !videoRef.value) {
      stream.getTracks().forEach((tr) => tr.stop())
      stream = null
      return
    }

    videoRef.value.srcObject = stream
    await videoRef.value.play()
    scanning.value = true

    reader = new BrowserQRCodeReader()
    // decodeFromVideoElement returns a Promise<IScannerControls> — await it,
    // otherwise stop() would silently do nothing and the camera stays on.
    decodingControls = await reader.decodeFromVideoElement(videoRef.value, (result) => {
      if (result && !locked && !props.loading) {
        locked = true
        emit('submit', result.getText())
      }
    })

    // Closed while the decoder was starting.
    if (unmounted) stopCamera()
  } catch (e) {
    scanning.value = false
    stopCamera()
    cameraError.value = errorMessage(e)
  }
}

function errorMessage(e) {
  switch (e?.name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return t('auth.qrPermissionDenied')
    case 'NotFoundError':
    case 'OverconstrainedError':
      return t('auth.qrNoCamera')
    case 'InsecureContextError':
      return t('auth.qrInsecure')
    default:
      return t('auth.qrCameraFailed')
  }
}

function retry() {
  locked = false
  cameraError.value = ''
  start()
}

// Unlock scanning again after a failed attempt, otherwise one wrong/expired
// card would stop the scanner forever.
watch(
  () => props.loading,
  (isLoading, wasLoading) => {
    if (wasLoading && !isLoading) locked = false
  },
)

function stopCamera() {
  decodingControls?.stop()
  decodingControls = null
  reader = null
  stream?.getTracks().forEach((tr) => tr.stop())
  stream = null
  scanning.value = false
}

onMounted(start)
onBeforeUnmount(() => {
  unmounted = true
  stopCamera()
})
</script>

<style scoped>
.scan-line {
  top: 0;
  animation: scan 2.2s ease-in-out infinite alternate;
}
@keyframes scan {
  from { top: 0; }
  to   { top: calc(100% - 2px); }
}
</style>