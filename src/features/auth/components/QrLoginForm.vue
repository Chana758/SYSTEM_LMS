<template>
  <div>
    <div v-if="supported" class="relative rounded-xl overflow-hidden bg-gray-900 aspect-square mb-4">
      <video ref="videoRef" class="w-full h-full object-cover" muted playsinline></video>
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
      Camera scanning isn't supported in this browser.
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

const props = defineProps({
  loading: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['submit'])

const videoRef = ref(null)
const supported = 'BarcodeDetector' in window
const scanning = ref(false)

let stream = null
let detector = null
let pollHandle = null
let locked = false

async function start() {
  if (!supported) return
  try {
    detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
    videoRef.value.srcObject = stream
    await videoRef.value.play()
    scanning.value = true
    poll()
  } catch (e) {
    scanning.value = false
  }
}

function poll() {
  pollHandle = setInterval(async () => {
    if (locked || props.loading || !videoRef.value) return
    try {
      const codes = await detector.detect(videoRef.value)
      if (codes.length > 0) {
        locked = true
        emit('submit', codes[0].rawValue)
      }
    } catch (e) {
      // ignore transient detection errors (e.g. video not ready yet)
    }
  }, 400)
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
  clearInterval(pollHandle)
  stream?.getTracks().forEach((t) => t.stop())
  scanning.value = false
}

onMounted(start)
onBeforeUnmount(stopCamera)
</script>