/**
 * printMembershipCard.js
 * ─────────────────────────────────────────────────────────────────
 * Opens a print window with the library ID card at real size (CR80,
 * 85.6 × 54 mm): front and back side by side on A4 with cut marks
 * and a fold line, so a school can print, cut, fold and laminate.
 *
 * The card itself comes from membershipCardMarkup.js, the same markup
 * as the on-screen preview (MembershipCardDesign.vue).
 * ─────────────────────────────────────────────────────────────────
 */
import { useBrandingStore } from '@/stores/brandingStore'
import defaultLogo from '@/assets/images/logoh6.jpg'
import { CARD_CSS, cardBackHtml, cardFrontHtml, esc } from './membershipCardMarkup'

const absolute = (url) => (url ? new URL(url, window.location.origin).href : '')

function currentBrand() {
  let store = null
  try {
    store = useBrandingStore()
  } catch {
    store = null
  }
  return {
    logoUrl: absolute(store?.logoUrl || defaultLogo),
    siteName: store?.siteName || 'SMART',
    siteNameAccent: store?.siteNameAccent || 'NEXUS',
  }
}

/**
 * @param {Object} card  see cardFrontHtml() in membershipCardMarkup.js
 */
export function printMembershipCard(card) {
  if (!card?.qrDataUrl) return

  const brand = currentBrand()
  const data = { ...card, avatarUrl: card.avatarUrl ? absolute(card.avatarUrl) : null, idValue: String(card.idValue ?? '—') }

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) return

  win.document.write(`<!DOCTYPE html>
<html lang="km">
<head>
  <meta charset="utf-8" />
  <title>Library card · ${esc(data.idValue)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f1f5f9; font-family: 'Kantumruy Pro', system-ui, sans-serif; color: #334155; }
    .sheet { padding: 12mm; }
    .hint { font-size: 12px; margin: 0 0 8mm; line-height: 1.6; }
    .pair { position: relative; display: inline-flex; gap: 0; padding: 6mm; }
    .slot { position: relative; }
    .fold { position: absolute; top: 2mm; bottom: 2mm; left: calc(6mm + 85.6mm); border-left: .3mm dashed #94a3b8; }
    .fold span { position: absolute; top: -4.5mm; left: -6mm; font-size: 8px; color: #64748b; white-space: nowrap; }
    .mark { position: absolute; width: 4mm; height: 4mm; border-color: #64748b; border-style: solid; border-width: 0; }
    .tl { top: 1.5mm; left: 1.5mm; border-top-width: .25mm; border-left-width: .25mm; }
    .tr { top: 1.5mm; right: 1.5mm; border-top-width: .25mm; border-right-width: .25mm; }
    .bl { bottom: 1.5mm; left: 1.5mm; border-bottom-width: .25mm; border-left-width: .25mm; }
    .br { bottom: 1.5mm; right: 1.5mm; border-bottom-width: .25mm; border-right-width: .25mm; }
    .snx-card { border-radius: 0 !important; }
    .slot:first-child .snx-card { border-radius: 3.2mm 0 0 3.2mm !important; }
    .slot:last-child .snx-card { border-radius: 0 3.2mm 3.2mm 0 !important; }
    @media screen { .pair { background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,.12); border-radius: 4px; } }
    @media print { body { background: #fff; } .sheet { padding: 0; } .hint { display: none; } }
    ${CARD_CSS}
  </style>
</head>
<body>
  <div class="sheet">
    <p class="hint">
      បោះពុម្ពទំហំ <b>100% (Actual size)</b> កុំជ្រើស "Fit to page"។ កាត់តាមសញ្ញាជ្រុង បត់ពាក់កណ្ដាលតាមបន្ទាត់ចុច រួចស្រោបប្លាស្ទិក (Laminate)។<br/>
      Print at 100% (actual size). Cut on the corner marks, fold on the dashed line, then laminate.
    </p>
    <div class="pair">
      <span class="mark tl"></span><span class="mark tr"></span><span class="mark bl"></span><span class="mark br"></span>
      <div class="fold"><span>បត់ · fold</span></div>
      <div class="slot">${cardFrontHtml(data, brand)}</div>
      <div class="slot">${cardBackHtml(data, brand)}</div>
    </div>
  </div>
  <script>
    (function () {
      var imgs = Array.prototype.slice.call(document.images).map(function (img) {
        return img.complete ? Promise.resolve() : new Promise(function (ok) { img.onload = img.onerror = ok; });
      });
      var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      var timeout = new Promise(function (ok) { setTimeout(ok, 4000); });
      Promise.race([Promise.all(imgs.concat([fonts])), timeout]).then(function () {
        setTimeout(function () { window.focus(); window.print(); }, 150);
      });
    })();
  <\/script>
</body>
</html>`)
  win.document.close()
}
