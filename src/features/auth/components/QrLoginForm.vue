<template>
  <div>
    <div v-if="supported" class="relative rounded-xl overflow-hidden bg-gray-900 aspect-square mb-4">
      <video ref="videoRef" class="w-full h-full object-cover" muted playsinline autoplay></video>
      <div class="absolute inset-8 border-2 border-green-400 rounded-xl pointer-events-none">
        <span class="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-green-300 rounded-tl-lg"></span>
        <span class="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-green-300 rounded-tr-lg"></span>
        <span class="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-green-300 rounded-bl-lg"></span>
        <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-green-300 rounded-br-lg"></span>
      </div>
      <div v-if="scanning" class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
        <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
        <span class="text-xs text-white font-medium">Scanning</span>
      </div>
    </div>

    <div v-else class="rounded-xl bg-amber-50 border border-amber-100 p-6 mb-4 text-sm text-amber-700 text-center">
      Camera scanning isn't supported on this device. Please allow camera access or use email/password instead.
    </div>

    <p class="text-xs text-gray-400 text-center mb-2">
      Point your library QR card at the camera above.
    </p>

    <p v-if="loading" class="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 text-center">
      Verifying...
    </p>
    <p v-else-if="errors.general" class="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 text-center">
      {{ errors.general }}
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'

const props = defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const videoRef = ref(null)
const scanning = ref(false)

// FIX: camera QR scanning now works on iPhone too. This previously
// checked `'BarcodeDetector' in window` — a Chrome/Edge-only native API
// that Safari has never implemented, so `supported` was always false on
// every iPhone (Safari and Chrome-for-iOS alike, since iOS Chrome runs
// on WebKit under the hood). Camera-based QR login was effectively
// iPhone-unusable before this change; only email/password worked there.
//
// We now decode QR codes ourselves with ZXing (@zxing/browser), reading
// pixels off a canvas instead of relying on a native detector, so the
// only real requirement is basic camera access — supported everywhere.
const supported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

let stream = null
let reader = null
let decodingControls = null
let locked = false

async function start() {
  if (!supported) return
  try {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      throw Object.assign(new Error('Insecure context'), { name: 'InsecureContextError' })
    }

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
    })
    videoRef.value.srcObject = stream
    await videoRef.value.play()
    scanning.value = true

    reader = new BrowserQRCodeReader()
    // FIX: decodeFromVideoElement() returns a Promise<IScannerControls>,
    // not the controls object itself. The previous version stored the
    // unresolved Promise directly, so `decodingControls?.stop()` in
    // stopCamera() silently no-op'd (Promise has no .stop() method) —
    // the QR decode loop (and camera hardware) kept running even after
    // switching back to the Password tab, which is exactly the "camera
    // won't turn off" symptom being reported.
    decodingControls = await reader.decodeFromVideoElement(videoRef.value, (result) => {
      // ZXing keeps calling this repeatedly (including with "not found"
      // noise every frame it doesn't see a code) until controls.stop()
      // is called, so we guard with `locked` exactly like the previous
      // implementation did.
      if (result && !locked && !props.loading) {
        locked = true
        emit('submit', result.getText())
      }
    })
  } catch (e) {
    scanning.value = false
  }
}

// FIX: unlock scanning again once a failed attempt finishes — otherwise
// after one wrong/expired card, the form would silently stop scanning
// forever since `locked` was never reset.
watch(
  () => props.loading,
  (isLoading, wasLoading) => {
    if (wasLoading && !isLoading) {
      locked = false
    }
  }
)

function stopCamera() {
  decodingControls?.stop()
  decodingControls = null
  reader = null
  stream?.getTracks().forEach((t) => t.stop())
  scanning.value = false
}

onMounted(start)
onBeforeUnmount(stopCamera)
</script>