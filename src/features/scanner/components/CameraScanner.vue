<template>
  <div class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
    <div v-if="!supported" class="text-center py-10">
      <div class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-600">Camera scanning isn't supported</p>
      <p class="text-xs text-gray-400 mt-1">Please switch to Manual / USB Scanner instead</p>
    </div>

    <template v-else>
      <div class="relative rounded-2xl overflow-hidden bg-gray-900 aspect-video">
        <video ref="videoRef" class="w-full h-full object-cover" muted playsinline></video>

        <div v-if="!isScanning" class="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
          <p class="text-xs text-white/70">Camera preview will appear here</p>
        </div>

        <div class="absolute inset-8 border-2 border-green-400/80 rounded-xl pointer-events-none">
          <span class="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-green-300 rounded-tl-lg"></span>
          <span class="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-green-300 rounded-tr-lg"></span>
          <span class="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-green-300 rounded-bl-lg"></span>
          <span class="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-green-300 rounded-br-lg"></span>
        </div>

        <div v-if="isScanning" class="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          <span class="text-xs text-white font-medium">Scanning</span>
        </div>
      </div>

      <div class="flex justify-center mt-4">
        <button
          v-if="!isScanning"
          @click="start"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white text-sm font-semibold rounded-xl hover:bg-green-800 active:scale-[0.98] transition"
        >
          <PlayIcon class="w-4 h-4" />
          Start Camera
        </button>
        <button
          v-else
          @click="stop"
          class="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 active:scale-[0.98] transition"
        >
          <StopIcon class="w-4 h-4" />
          Stop Camera
        </button>
      </div>

      <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5 text-center mt-3">{{ error }}</p>
    </template>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { PlayIcon, StopIcon } from '@heroicons/vue/24/solid'
import { barcodeService } from '../services'

const emit = defineEmits(['detected'])

const supported = barcodeService.isSupported()
const videoRef = ref(null)
const isScanning = ref(false)
const error = ref('')

let stream = null
let detector = null
let pollHandle = null

const start = async () => {
  error.value = ''
  try {
    detector = await barcodeService.createDetector()
    stream = await barcodeService.startCamera(videoRef.value)
    isScanning.value = true
    poll()
  } catch (e) {
    error.value = 'Could not access the camera. Check permissions and try again.'
  }
}

const poll = () => {
  pollHandle = setInterval(async () => {
    if (!videoRef.value || !detector) return
    const barcode = await barcodeService.detectFromVideoFrame(detector, videoRef.value)
    if (barcode) {
      emit('detected', barcode)
      stop()
    }
  }, 400)
}

const stop = () => {
  clearInterval(pollHandle)
  barcodeService.stopCamera(stream)
  isScanning.value = false
}

onBeforeUnmount(stop)
</script>