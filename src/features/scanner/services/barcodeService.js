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
}