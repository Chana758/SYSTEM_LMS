/**
 * currencyHelper.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for currency conversion throughout the library
 * (Riel ↔ USD) as well as display formatting functions.
 *
 * You must use these helpers everywhere currency conversion happens
 * (ReturnForm.vue, FineForm.vue, etc.) — do not write separate
 * conversion logic inside individual components, as that is the exact
 * reason why fine amounts become incorrect (e.g., Riel input being sent
 * to the backend directly as USD without conversion).
 * ─────────────────────────────────────────────────────────────────
 */

// ⚠️ TODO: Update this to the actual exchange rate (National Bank of Cambodia
// or a fixed rate decided by your library) — 4100 is only an estimated value
export const KHR_TO_USD_RATE = 4100 // ៛ per 1$

/**
 * Convert amount from Riel (៛) to USD ($)
 * @param {number} khrAmount - Amount in Riel
 * @returns {number} Amount in USD (rounded to 2 decimal places)
 */
export function khrToUsd(khrAmount) {
  const amount = Number(khrAmount) || 0
  const usd = amount / KHR_TO_USD_RATE
  return Math.round(usd * 100) / 100
}

/**
 * Convert amount from USD ($) to Riel (៛)
 * @param {number} usdAmount - Amount in USD
 * @returns {number} Amount in Riel (rounded to the nearest integer)
 */
export function usdToKhr(usdAmount) {
  const amount = Number(usdAmount) || 0
  return Math.round(amount * KHR_TO_USD_RATE)
}

/**
 * Format an amount as a USD display string — "$5.00"
 * @param {number} amount - Amount in USD
 * @returns {string}
 */
export function formatUsd(amount) {
  const n = Number(amount) || 0
  return `$${n.toFixed(2)}`
}

/**
 * Format an amount as a Riel display string — "5,000៛"
 * @param {number} amount - Amount in Riel
 * @returns {string}
 */
export function formatKhr(amount) {
  const n = Number(amount) || 0
  return `${n.toLocaleString('en-US')}៛`
}