/**
 * printMembershipCard.js
 * ─────────────────────────────────────────────────────────────────
 * Shared print logic for QR membership cards — used by any page/component
 * that issues a card and needs a "Print ID Card" action (PendingCardsPage.vue,
 * and future call sites like QrLoginCardAdmin.vue).
 *
 * Colors here are kept in sync with the `themes` object in
 * MembershipCardDesign.vue — if that component's palette changes,
 * update THEME_COLORS below to match, so the printed card still looks
 * the same as the on-screen preview.
 * ─────────────────────────────────────────────────────────────────
 */

const THEME_COLORS = {
  member:    { grad: '#047857, #065f46', accent: '#047857', box: '#ecfdf5' },
  librarian: { grad: '#1d4ed8, #3730a3', accent: '#1d4ed8', box: '#eff6ff' },
  admin:     { grad: '#d97706, #c2410c', accent: '#d97706', box: '#fffbeb' },
}

/**
 * @param {Object} card
 * @param {string} card.qrDataUrl
 * @param {string} card.name
 * @param {string} [card.avatarUrl]
 * @param {string} card.role - 'member' | 'librarian' | 'admin'
 * @param {string} card.idLabel
 * @param {string} card.idValue
 * @param {string} [card.subLabel]
 * @param {string} [card.expiresAt]
 */
export function printMembershipCard(card) {
  if (!card?.qrDataUrl) return

  const colors = THEME_COLORS[card.role] || THEME_COLORS.member
  const initials = (card.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'

  const avatarBlock = card.avatarUrl
    ? `<img src="${card.avatarUrl}" style="width:80px;height:80px;border-radius:16px;object-fit:cover;border:4px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.15);" />`
    : `<div style="width:80px;height:80px;border-radius:16px;border:4px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.15);background:linear-gradient(135deg, ${colors.grad});display:flex;align-items:center;justify-content:center;color:#fff;font-size:26px;font-weight:900;">${initials}</div>`

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const win = window.open('', '_blank', 'width=500,height=750')
  win.document.write(`
    <html>
      <head>
        <title>Library Card</title>
        <style>
          * { box-sizing: border-box; }
          body { display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f1f5f9; font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; }
          @media print { body { background: #fff; } }
        </style>
      </head>
      <body onload="window.print(); window.close();">
        <div style="width:360px;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.15);border:1px solid #e5e7eb;background:#fff;">
          <div style="background:linear-gradient(135deg, ${colors.grad});padding:16px 20px 40px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;">
                <span style="color:#fff;font-size:16px;">📖</span>
              </div>
              <span style="color:#fff;font-size:14px;font-weight:700;">Library LMS</span>
              <span style="margin-left:auto;color:#fff;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;background:rgba(255,255,255,0.2);padding:4px 10px;border-radius:999px;">${card.role}</span>
            </div>
          </div>

          <div style="padding:0 20px;margin-top:-32px;">
            <div style="display:flex;align-items:flex-end;gap:16px;">
              ${avatarBlock}
              <div style="flex:1;padding-bottom:4px;">
                <p style="margin:0;font-size:16px;font-weight:900;color:#111827;">${card.name}</p>
                <p style="margin:2px 0 0;font-size:12px;font-weight:600;color:${colors.accent};">${card.subLabel || ''}</p>
              </div>
            </div>
          </div>

          <div style="padding:20px;padding-top:16px;">
            <div style="background:${colors.box};border-radius:12px;padding:14px;margin-bottom:16px;">
              <p style="margin:0;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:${colors.accent};">${card.idLabel}</p>
              <p style="margin:2px 0 0;font-size:18px;font-weight:900;font-family:monospace;color:#1f2937;">${card.idValue}</p>
            </div>

            <div style="display:flex;align-items:center;gap:16px;">
              <img src="${card.qrDataUrl}" style="width:96px;height:96px;border:2px solid ${colors.box};border-radius:12px;padding:4px;background:#fff;" />
              <div style="flex:1;font-size:12px;color:#6b7280;line-height:1.5;">
                <p style="margin:0;">Scan at the library kiosk to log in instantly.</p>
                <p style="margin:4px 0 0;font-weight:700;color:${colors.accent};">Valid until ${formatDate(card.expiresAt)}</p>
              </div>
            </div>
          </div>

          <div style="border-top:1px dashed #e5e7eb;">
            <p style="text-align:center;font-size:10px;font-weight:800;color:${colors.accent};padding:8px 0;text-transform:uppercase;letter-spacing:.15em;margin:0;">
              Official Library Card
            </p>
          </div>
        </div>
      </body>
    </html>
  `)
  win.document.close()
}