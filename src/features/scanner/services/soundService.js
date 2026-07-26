// Web Audio API beep sounds — no external audio files needed.
// Gives instant audible feedback so front-desk staff don't have to
// stare at the screen after every scan.

const AudioCtx = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null
let ctx = null

function getCtx() {
  if (!AudioCtx) return null
  if (!ctx) ctx = new AudioCtx()
  return ctx
}

function beep({ frequency = 880, duration = 120, type = 'sine', volume = 0.15 } = {}) {
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
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration / 1000)
  oscillator.stop(audioCtx.currentTime + duration / 1000)
}

export const soundService = {
  success() {
    beep({ frequency: 1046, duration: 110, type: 'sine', volume: 0.18 })
  },
  error() {
    beep({ frequency: 220, duration: 220, type: 'square', volume: 0.15 })
    setTimeout(() => beep({ frequency: 180, duration: 220, type: 'square', volume: 0.15 }), 150)
  },
  notFound() {
    beep({ frequency: 440, duration: 160, type: 'triangle', volume: 0.15 })
  },
  vibrate(pattern = [40]) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern)
    }
  },
}