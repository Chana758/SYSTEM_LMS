import QRCode from 'qrcode'

export const qrToDataUrl = (text, opts = {}) =>
  QRCode.toDataURL(String(text), { width: 256, margin: 1, errorCorrectionLevel: 'M', ...opts })

export const qrToSvg = (text, opts = {}) =>
  QRCode.toString(String(text), { type: 'svg', margin: 1, ...opts })

export async function downloadQr(text, filename = 'qr', opts = {}) {
  const url = await qrToDataUrl(text, { width: 512, ...opts })
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.png`
  document.body.appendChild(a)
  a.click()
  a.remove()
}