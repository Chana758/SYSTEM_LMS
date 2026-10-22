export function coverUrl(path) {
  if (!path) return ''
  if (/^(https?:|data:)/.test(path)) return path

  // Strip only a trailing "/api", never one inside the host name.
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
  const clean = path.replace(/^\//, '')

  return clean.startsWith('storage/') ? `${base}/${clean}` : `${base}/storage/${clean}`
}