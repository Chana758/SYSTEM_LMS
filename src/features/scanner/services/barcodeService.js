import { BrowserMultiFormatReader } from '@zxing/browser'

export const barcodeService = {
  // FIX: camera scanning now works cross-browser. Previously this checked
  // for `window.BarcodeDetector`, a native API that Chrome/Edge (Chromium)
  // support but Safari never implemented — meaning camera scanning was
  // silently unusable on every iPhone (Safari AND Chrome-for-iOS, since
  // iOS Chrome is just Safari's WebKit engine under the hood).
  //
  // We now decode barcodes ourselves via ZXing (@zxing/browser), which
  // reads pixels off a <canvas> instead of relying on a native detector,
  // so the only real requirement left is basic camera access — supported
  // on iOS Safari, Android Chrome, desktop browsers, etc.
  isSupported() {
    return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  },

  // Replaces createDetector(). One reader instance per scan session.
  createReader() {
    return new BrowserMultiFormatReader()
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

    // `ideal` (not a hard constraint) so it still falls back gracefully
    // on devices/browsers that don't expose facingMode at all (e.g. some
    // desktop webcams), instead of throwing OverconstrainedError.
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
    })

    videoElement.srcObject = stream
    await videoElement.play()
    return stream
  },

  stopCamera(stream) {
    stream?.getTracks().forEach((track) => track.stop())
  },

  // Replaces detectFromVideoFrame(). ZXing decodes continuously off the
  // already-playing <video> element and calls onDetected(text) the moment
  // it finds a barcode. Returns "controls" — call controls.stop() to
  // cancel decoding (do this in your cleanup / stop() handler).
  //
  // NOTE: the callback also fires repeatedly with a NotFoundException
  // while no barcode is in frame — that's normal per-frame "nothing found
  // yet" noise from ZXing, not an error to show the user, so we simply
  // ignore it here.
  // FIX: @zxing/browser's decodeFromVideoElement() returns a
  // Promise<IScannerControls>, NOT the controls object directly. The
  // previous version did `return reader.decodeFromVideoElement(...)`
  // without awaiting it, so callers stored a pending Promise in
  // `decodingControls`. Calling `decodingControls?.stop()` later then
  // silently did nothing — Promise has no `.stop()` method, and
  // optional chaining swallows that instead of throwing — so the
  // decode loop (and the camera hardware itself) never actually
  // stopped, even after switching tabs or clicking "Stop Camera".
  // Marking this async + awaiting fixes it: callers now get the real
  // controls object once decoding has actually started.
  async startDecoding(reader, videoElement, onDetected) {
    return await reader.decodeFromVideoElement(videoElement, (result) => {
      if (result) {
        onDetected(result.getText())
      }
    })
  },

  // Torch (flashlight) control. Supported on most Android Chrome cameras
  // via MediaStreamTrack capabilities. iOS Safari does not expose torch
  // control to web pages at all — hasTorch() simply returns false there,
  // which the UI already handles gracefully (torch button just doesn't
  // render, per the existing v-if="isScanning && torchSupported" guard).
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