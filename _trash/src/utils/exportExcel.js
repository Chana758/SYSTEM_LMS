function cell(v) {
  let s = v == null ? '' : String(v)
  if (/^[=+\-@]/.test(s) && typeof v === 'string') s = `'${s}` 
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * columns: [{ key, label, value?: (row) => any }]
 */
export function exportToExcel({ filename = 'export', columns, rows }) {
  const header = columns.map((c) => cell(c.label)).join(',')
  const body = rows
    .map((r) => columns.map((c) => cell(c.value ? c.value(r) : r[c.key])).join(','))
    .join('\r\n')
  const blob = new Blob(['\uFEFF' + header + '\r\n' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}