
import { BrowserMultiFormatReader } from '@zxing/browser'

export const barcodeService = {
  // Check whether the browser supports camera access.
  isSupported() {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices?.getUserMedia
    )
  },

  // Create a reader for barcode and QR code scanning.
  createReader() {
    return new BrowserMultiFormatReader()
  },

  // Start the camera and display its video.
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
      video: { facingMode: { ideal: 'environment' } },
    })

    videoElement.srcObject = stream
    await videoElement.play()

    return stream
  },

  // Stop all camera tracks.
  stopCamera(stream) {
    stream?.getTracks().forEach((track) => track.stop())
  },

  // Scan video and return detected barcode text through a callback.
  async startDecoding(reader, videoElement, onDetected) {
    return await reader.decodeFromVideoElement(videoElement, (result) => {
      if (result) {
        onDetected(result.getText())
      }
    })
  },

  // Check whether the camera supports a flashlight.
  hasTorch(stream) {
    const track = stream?.getVideoTracks?.()[0]
    const capabilities = track?.getCapabilities?.()

    return !!capabilities?.torch
  },

  // Turn the flashlight on or off.
  async setTorch(stream, enabled) {
    const track = stream?.getVideoTracks?.()[0]

    if (!track) return false

    const capabilities = track.getCapabilities?.()

    if (!capabilities?.torch) return false

    try {
      await track.applyConstraints({
        advanced: [{ torch: enabled }],
      })

      return true
    } catch {
      return false
    }
  },
}
