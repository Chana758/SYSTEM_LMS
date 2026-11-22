/**
 * membershipCardMarkup.js
 * ─────────────────────────────────────────────────────────────────
 * One source for the library ID card (front + back), shared by the
 * on-screen preview (MembershipCardDesign.vue) and the print window
 * (printMembershipCard.js), so both always look the same.
 *
 * Size: CR80, the standard ID / bank card (85.6 × 54 mm, landscape).
 * Styles are inline-safe and prefixed "snx-" so they never clash with
 * the app's Tailwind classes.
 * ─────────────────────────────────────────────────────────────────
 */

export const CARD_W_MM = 85.6
export const CARD_H_MM = 54
export const CARD_W_PX = (CARD_W_MM / 25.4) * 96 // ≈ 323.5 px at 96 dpi

const THEMES = {
  member:    { dark: '#0f3d24', mid: '#166534', light: '#ecfdf3', accent: '#d4a017', chipKm: 'សមាជិក',   chipEn: 'MEMBER' },
  librarian: { dark: '#172554', mid: '#1d4ed8', light: '#eff6ff', accent: '#d4a017', chipKm: 'បុគ្គលិក', chipEn: 'STAFF' },
  admin:     { dark: '#7c2d12', mid: '#c2410c', light: '#fff7ed', accent: '#facc15', chipKm: 'អ្នកគ្រប់គ្រង', chipEn: 'ADMIN' },
}

const TYPE_LABELS = {
  student: 'សិស្ស · Student',
  teacher: 'គ្រូ · Teacher',
  staff:   'បុគ្គលិក · Staff',
  public:  'សាធារណៈ · Public',
  guest:   'ភ្ញៀវ · Guest',
}

export function themeFor(role) {
  return THEMES[role] || THEMES.member
}

export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatDate(d) {
  if (!d) return '—'
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initialsOf(name) {
  const latin = (name || '').match(/[A-Za-z]+/g)
  if (latin?.length) return latin.map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (name || '?').trim().slice(0, 1) || '?'
}

function typeLabel(card) {
  if (card.role === 'librarian') return card.subLabel || 'បុគ្គលិកបណ្ណាល័យ · Library staff'
  const code = (card.memberType || '').toLowerCase()
  return TYPE_LABELS[code] || (code ? code.charAt(0).toUpperCase() + code.slice(1) : '—')
}

/** CSS for both sides. Units are mm so print size is exact. */
export const CARD_CSS = `
.snx-card{position:relative;width:${CARD_W_MM}mm;height:${CARD_H_MM}mm;border-radius:3.2mm;overflow:hidden;background:#fff;
  font-family:'Kantumruy Pro','Noto Sans Khmer',system-ui,sans-serif;color:#0f172a;box-sizing:border-box;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.snx-card *{box-sizing:border-box;margin:0;padding:0}
.snx-guilloche{position:absolute;inset:0;opacity:.07;pointer-events:none}
.snx-head{position:absolute;left:0;right:0;top:0;height:12.5mm;display:flex;align-items:center;gap:2.2mm;padding:0 3.2mm}
.snx-logo{width:8.6mm;height:8.6mm;border-radius:50%;background:#fff;object-fit:cover;flex-shrink:0}
.snx-brand{line-height:1.05;min-width:0}
.snx-brand b{display:block;font-size:3.5mm;font-weight:800;letter-spacing:.35mm;color:#fff;white-space:nowrap}
.snx-brand span{display:block;font-size:2.05mm;font-weight:500;color:rgba(255,255,255,.85);margin-top:.5mm;white-space:nowrap}
.snx-chip{margin-left:auto;font-size:1.9mm;font-weight:800;letter-spacing:.3mm;padding:.8mm 2mm;border-radius:5mm;color:#1a1a1a;white-space:nowrap}
.snx-stripe{position:absolute;left:0;right:0;top:12.5mm;height:.8mm}
.snx-body{position:absolute;left:3.2mm;right:3.2mm;top:16mm;bottom:6.2mm;display:flex;gap:3mm}
.snx-photo{width:19mm;height:24mm;border-radius:2mm;object-fit:cover;flex-shrink:0;border:.6mm solid;background:#f1f5f9}
.snx-photo-fallback{display:flex;align-items:center;justify-content:center;font-size:7mm;font-weight:800;color:#fff}
.snx-info{flex:1;min-width:0;display:flex;flex-direction:column}
.snx-name{font-size:3.7mm;font-weight:800;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.snx-name-en{font-size:2.3mm;font-weight:600;letter-spacing:.25mm;text-transform:uppercase;color:#475569;margin-top:.3mm;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.snx-fields{display:grid;grid-template-columns:1fr 1fr;gap:1.3mm 2mm;margin-top:2.2mm}
.snx-field i{display:block;font-style:normal;font-size:1.7mm;font-weight:600;color:#64748b;line-height:1.2;white-space:nowrap}
.snx-field b{display:block;font-size:2.35mm;font-weight:700;color:#0f172a;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.snx-field b.mono{font-family:ui-monospace,'SF Mono',Menlo,monospace;letter-spacing:.1mm}
.snx-qr{width:21.5mm;flex-shrink:0;display:flex;flex-direction:column;align-items:center}
.snx-qr-box{width:21.5mm;height:21.5mm;padding:1mm;background:#fff;border-radius:1.6mm;border:.35mm solid #e2e8f0}
.snx-qr-box img{width:100%;height:100%;display:block;image-rendering:pixelated}
.snx-qr small{font-size:1.65mm;font-weight:600;color:#475569;margin-top:.9mm;text-align:center;line-height:1.2;white-space:nowrap}
.snx-foot{position:absolute;left:0;right:0;bottom:0;height:4.6mm;display:flex;align-items:center;justify-content:space-between;padding:0 3.2mm;
  font-size:1.75mm;font-weight:600;color:rgba(255,255,255,.92)}
.snx-foot .mono{font-family:ui-monospace,'SF Mono',Menlo,monospace;letter-spacing:.35mm}
/* back */
.snx-back-head{position:absolute;left:0;right:0;top:0;height:8mm;display:flex;align-items:center;justify-content:space-between;padding:0 3.2mm}
.snx-back-head b{font-size:2.7mm;font-weight:800;color:#fff}
.snx-back-head span{font-size:1.9mm;font-weight:600;color:rgba(255,255,255,.85)}
.snx-rules{position:absolute;left:3.2mm;right:3.2mm;top:10.3mm;list-style:none;counter-reset:r}
.snx-rules li{counter-increment:r;display:flex;gap:1.5mm;font-size:2.05mm;line-height:1.35;margin-bottom:1.05mm;color:#1e293b}
.snx-rules li::before{content:counter(r);flex-shrink:0;width:3mm;height:3mm;border-radius:50%;font-size:1.7mm;font-weight:800;color:#fff;
  display:flex;align-items:center;justify-content:center;margin-top:.15mm;background:var(--snx-mid)}
.snx-rules li em{font-style:normal;color:#64748b}
.snx-found{position:absolute;left:3.2mm;right:3.2mm;top:33.5mm;padding:1.2mm 2mm;border-radius:1.5mm;font-size:1.85mm;line-height:1.35;color:#334155}
.snx-sign{position:absolute;left:3.2mm;right:3.2mm;bottom:6.3mm;display:flex;gap:6mm}
.snx-sign div{flex:1;border-top:.3mm solid #94a3b8;padding-top:.7mm;font-size:1.7mm;font-weight:600;color:#64748b;text-align:center}
`

const guilloche = (color) => `
<svg class="snx-guilloche" viewBox="0 0 856 540" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="${color}" stroke-width="1.4">
    ${Array.from({ length: 14 }, (_, i) => {
      const y = 150 + i * 28
      return `<path d="M0 ${y} C 140 ${y - 60}, 280 ${y + 60}, 428 ${y} S 716 ${y - 60}, 856 ${y}"/>`
    }).join('')}
    <circle cx="700" cy="330" r="150"/><circle cx="700" cy="330" r="118"/><circle cx="700" cy="330" r="86"/>
  </g>
</svg>`

/**
 * @param {Object} card
 * @param {string} card.qrDataUrl
 * @param {string} card.name        Khmer (or main) name
 * @param {string} [card.nameEn]    Latin name
 * @param {string} [card.avatarUrl]
 * @param {string} card.role        'member' | 'librarian' | 'admin'
 * @param {string} card.idLabel
 * @param {string} card.idValue
 * @param {string} [card.className]
 * @param {string} [card.memberType]
 * @param {string} [card.subLabel]
 * @param {string} [card.expiresAt]
 * @param {Object} brand            { logoUrl, siteName, siteNameAccent }
 */
export function cardFrontHtml(card, brand = {}) {
  const th = themeFor(card.role)
  const isStaff = card.role === 'librarian'
  const site = `${esc(brand.siteName || 'SMART')} ${esc(brand.siteNameAccent || 'NEXUS')}`.trim()

  const photo = card.avatarUrl
    ? `<img class="snx-photo" src="${esc(card.avatarUrl)}" alt="" style="border-color:${th.accent}" />`
    : `<div class="snx-photo snx-photo-fallback" style="border-color:${th.accent};background:linear-gradient(135deg,${th.mid},${th.dark})">${esc(initialsOf(card.nameEn || card.name))}</div>`

  const third = isStaff
    ? { km: 'ផ្នែក', en: 'Dept.', value: card.subLabel || '—' }
    : { km: 'ថ្នាក់', en: 'Class', value: card.className || '—' }

  return `
<div class="snx-card" style="--snx-mid:${th.mid}">
  ${guilloche(th.mid)}
  <div class="snx-head" style="background:linear-gradient(120deg,${th.dark},${th.mid})">
    ${brand.logoUrl ? `<img class="snx-logo" src="${esc(brand.logoUrl)}" alt="" />` : ''}
    <div class="snx-brand">
      <b>${site}</b>
      <span>${isStaff ? 'ប័ណ្ណបុគ្គលិកបណ្ណាល័យ · LIBRARY STAFF CARD' : 'ប័ណ្ណសមាជិកបណ្ណាល័យ · LIBRARY CARD'}</span>
    </div>
    <span class="snx-chip" style="background:${th.accent}">${th.chipEn}</span>
  </div>
  <div class="snx-stripe" style="background:${th.accent}"></div>

  <div class="snx-body">
    ${photo}
    <div class="snx-info">
      <p class="snx-name">${esc(card.name || '—')}</p>
      ${card.nameEn ? `<p class="snx-name-en">${esc(card.nameEn)}</p>` : ''}
      <div class="snx-fields">
        <div class="snx-field"><i>${isStaff ? 'អត្តលេខ · ID' : 'លេខសមាជិក · No.'}</i><b class="mono">${esc(card.idValue || '—')}</b></div>
        <div class="snx-field"><i>${third.km} · ${third.en}</i><b>${esc(third.value)}</b></div>
        <div class="snx-field"><i>ប្រភេទ · Type</i><b>${esc(typeLabel(card))}</b></div>
        <div class="snx-field"><i>ផុតកំណត់ · Valid until</i><b>${esc(formatDate(card.expiresAt))}</b></div>
      </div>
    </div>
    <div class="snx-qr">
      <div class="snx-qr-box"><img src="${esc(card.qrDataUrl)}" alt="QR" /></div>
      <small>ស្កេនចូលបណ្ណាល័យ</small>
    </div>
  </div>

  <div class="snx-foot" style="background:${th.dark}">
    <span>${isStaff ? 'Staff ID' : 'Member No.'} <span class="mono">${esc(card.idValue || '—')}</span></span>
    <span>${esc(th.chipKm)} · ${new Date().getFullYear()}</span>
  </div>
</div>`
}

export function cardBackHtml(card, brand = {}) {
  const th = themeFor(card.role)
  const site = `${esc(brand.siteName || 'SMART')} ${esc(brand.siteNameAccent || 'NEXUS')}`.trim()

  return `
<div class="snx-card" style="--snx-mid:${th.mid}">
  ${guilloche(th.mid)}
  <div class="snx-back-head" style="background:linear-gradient(120deg,${th.dark},${th.mid})">
    <b>លក្ខខណ្ឌប្រើប្រាស់</b><span>Terms of use</span>
  </div>
  <ol class="snx-rules">
    <li><span>ប័ណ្ណនេះសម្រាប់តែម្ចាស់ប័ណ្ណប៉ុណ្ណោះ មិនអាចឲ្យអ្នកផ្សេងខ្ចីប្រើ។ <em>Not transferable.</em></span></li>
    <li><span>ស្កេនប័ណ្ណពេលចូល និងចេញបណ្ណាល័យ និងពេលខ្ចីសៀវភៅ។ <em>Scan at entry, exit and loans.</em></span></li>
    <li><span>សងសៀវភៅទាន់ពេល ការយឺតនឹងត្រូវពិន័យ។ <em>Late returns are fined.</em></span></li>
    <li><span>បាត់ប័ណ្ណ សូមរាយការណ៍ភ្លាម ដើម្បីបិទប័ណ្ណចាស់។ <em>Report a lost card at once.</em></span></li>
  </ol>
  <div class="snx-found" style="background:${th.light}">
    បើរើសបានប័ណ្ណនេះ សូមប្រគល់ជូនបណ្ណាល័យ <b>${site}</b>។<br/>
    <em style="font-style:normal;color:#64748b">If found, please return it to the ${site} library.</em>
  </div>
  <div class="snx-sign">
    <div>ហត្ថលេខាម្ចាស់ប័ណ្ណ · Holder</div>
    <div>បណ្ណារក្ស · Librarian</div>
  </div>
  <div class="snx-foot" style="background:${th.dark}">
    <span>ចេញថ្ងៃ · Issued ${esc(formatDate(new Date()))}</span>
    <span class="mono">${esc(card.idValue || '—')}</span>
  </div>
</div>`
}
