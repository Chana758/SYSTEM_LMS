/**
 * currencyHelper.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth សម្រាប់ការបំលែងរូបិយប័ណ្ណក្នុង library ទាំងមូល
 * (Riel ↔ USD) ព្រមទាំង format function សម្រាប់បង្ហាញ។
 *
 * ត្រូវប្រើ helper ទាំងនេះនៅគ្រប់ទីកន្លែងដែលមានការបំលែងរូបិយប័ណ្ណ
 * (ReturnForm.vue, FineForm.vue, ។ល។) — កុំសរសេរ conversion logic
 * ដោយឡែកៗគ្នាតាម component នីមួយៗ ព្រោះនោះជាមូលហេតុពិតប្រាកដ
 * ដែលបណ្តាលឲ្យ fine amount ខុសឆ្គង (Riel input ត្រូវបានផ្ញើទៅ
 * backend ដោយផ្ទាល់ដូចជា USD គ្មានបំលែង)។
 * ─────────────────────────────────────────────────────────────────
 */

// ⚠️ TODO: ត្រូវកែជាអត្រាប្តូររូបិយប័ណ្ណពិតប្រាកដ (ធនាគារជាតិកម្ពុជា
// ឬអត្រាថេរដែល library របស់អ្នកសម្រេចប្រើ) — 4100 ជាតម្លៃប៉ាន់ស្មានតែប៉ុណ្ណោះ
export const KHR_TO_USD_RATE = 4100 // ៛ ក្នុង 1$

/**
 * បំលែងទឹកប្រាក់ពី Riel (៛) ទៅ USD ($)
 * @param {number} khrAmount - ចំនួនទឹកប្រាក់ជា Riel
 * @returns {number} ចំនួនទឹកប្រាក់ជា USD (round ទៅ 2 decimal)
 */
export function khrToUsd(khrAmount) {
  const amount = Number(khrAmount) || 0
  const usd = amount / KHR_TO_USD_RATE
  return Math.round(usd * 100) / 100
}

/**
 * បំលែងទឹកប្រាក់ពី USD ($) ទៅ Riel (៛)
 * @param {number} usdAmount - ចំនួនទឹកប្រាក់ជា USD
 * @returns {number} ចំនួនទឹកប្រាក់ជា Riel (round ទៅលេខគត់)
 */
export function usdToKhr(usdAmount) {
  const amount = Number(usdAmount) || 0
  return Math.round(amount * KHR_TO_USD_RATE)
}

/**
 * Format ចំនួនទឹកប្រាក់ជា USD string សម្រាប់បង្ហាញ — "$5.00"
 * @param {number} amount - ចំនួនទឹកប្រាក់ជា USD
 * @returns {string}
 */
export function formatUsd(amount) {
  const n = Number(amount) || 0
  return `$${n.toFixed(2)}`
}

/**
 * Format ចំនួនទឹកប្រាក់ជា Riel string សម្រាប់បង្ហាញ — "5,000៛"
 * @param {number} amount - ចំនួនទឹកប្រាក់ជា Riel
 * @returns {string}
 */
export function formatKhr(amount) {
  const n = Number(amount) || 0
  return `${n.toLocaleString('en-US')}៛`
}