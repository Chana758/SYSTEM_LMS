const MAX_FINE_AMOUNT_USD = 500

/**
 * @param {object} form - { borrow_id, amount, reason }
 * @param {object} opts
 * @param {'khr'|'usd'} opts.unit - which currency `form.amount` is
 *   denominated in. 'khr' for Create Fine (raw Riel, converted
 *   server-side by CurrencyHelper::khrToUsd() — see FineController::store()).
 *   'usd' for Edit Fine (the already-converted USD figure being
 *   adjusted directly — see FineController::update()).
 */
export function validateFineForm(form, { unit = 'usd' } = {}) {
  const errors = {}

  if (!form.borrow_id) {
    errors.borrow_id = 'Please select a borrow record'
  }

  if (!form.amount || form.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
  } else if (unit === 'usd' && Number(form.amount) > MAX_FINE_AMOUNT_USD) {
    errors.amount = `Amount cannot exceed $${MAX_FINE_AMOUNT_USD}. Double-check you didn't add an extra digit.`
  }

  if (!form.reason) {
    errors.reason = 'Please select a reason'
  }

  return errors
}