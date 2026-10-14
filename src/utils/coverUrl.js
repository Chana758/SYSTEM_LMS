export function coverUrl(path) {
  if (!path) return null
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')
  return `${base}/storage/${path}`
}