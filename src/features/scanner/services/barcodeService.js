export const barcodeService = {
  isSupported() {
    return typeof window !== 'undefined' && 'BarcodeDetector' in window
  },

  async createDetector() {
    if (!this.isSupported()) {
      throw new Error('BarcodeDetector is not supported in this browser.')
    }
    return new window.BarcodeDetector({
      formats: ['ean_13', 'upc_a', 'code_128', 'code_39', 'qr_code'],
    })
  },

  async detectFromVideoFrame(detector, videoElement) {
    try {
      const barcodes = await detector.detect(videoElement)
      return barcodes.length > 0 ? barcodes[0].rawValue : null
    } catch (e) {
      return null
    }
  },

  async startCamera(videoElement) {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      const err = new Error(
        'Camera access requires HTTPS (or localhost). This page is not running in a secure context.'
      )
      err.name = 'InsecureContextError'
      throw err
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      const err = new Error('This browser does not support camera access.')
      err.name = 'NotSupportedError'
      throw err
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })

    videoElement.srcObject = stream
    await videoElement.play()
    return stream
  },

  stopCamera(stream) {
    stream?.getTracks().forEach((track) => track.stop())
  },

  // 🆕 FIX: torch (flashlight) support. Not every device/camera exposes
  // this capability, so we detect first and no-op silently when absent
  // instead of throwing — CameraScanner.vue only shows the toggle button
  // when hasTorch() returns true.
  hasTorch(stream) {
    const track = stream?.getVideoTracks?.()[0]
    const capabilities = track?.getCapabilities?.()
    return !!capabilities?.torch
  },

  async setTorch(stream, enabled) {
    const track = stream?.getVideoTracks?.()[0]
    if (!track) return false
    const capabilities = track.getCapabilities?.()
    if (!capabilities?.torch) return false
    try {
      await track.applyConstraints({ advanced: [{ torch: enabled }] })
      return true
    } catch (e) {
      return false
    }
  },
}