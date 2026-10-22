
const AudioCtx =
  typeof window !== 'undefined'
    ? window.AudioContext || window.webkitAudioContext
    : null

let ctx = null

// Create or reuse the audio context.
function getCtx() {
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  return ctx
}

// Generate a beep sound with custom settings.
function beep({
  frequency = 880,
  duration = 120,
  type = 'sine',
  volume = 0.15,
} = {}) {
  const audioCtx = getCtx()
  if (!audioCtx) return

  if (audioCtx.state === 'suspended') audioCtx.resume()

  const oscillator = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.value = volume

  oscillator.connect(gain)
  gain.connect(audioCtx.destination)

  oscillator.start()

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audioCtx.currentTime + duration / 1000
  )

  oscillator.stop(audioCtx.currentTime + duration / 1000)
}

export const soundService = {
  // Play a high-pitched sound when an action succeeds.
  success() {
    beep({
      frequency: 1046,
      duration: 110,
      type: 'sine',
      volume: 0.18,
    })
  },

  // Play two low sounds when an error occurs.
  error() {
    beep({
      frequency: 220,
      duration: 220,
      type: 'square',
      volume: 0.15,
    })

    setTimeout(() => {
      beep({
        frequency: 180,
        duration: 220,
        type: 'square',
        volume: 0.15,
      })
    }, 150)
  },

  // Play a distinct sound when an item is not found.
  notFound() {
    beep({
      frequency: 440,
      duration: 160,
      type: 'triangle',
      volume: 0.15,
    })
  },

  // Vibrate the device if vibration is supported.
  vibrate(pattern = [40]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  },
}
