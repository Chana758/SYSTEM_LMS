// Fines are entered and stored in Riel (FIN1). 100 is the smallest KHQR amount.
const MIN_FINE_KHR = 100
const MAX_FINE_KHR = 2000000

/**
 * @param {object} form - { borrow_id, amount, reason }
 */
export function validateFineForm(form) {
  const errors = {}

  if (!form.borrow_id) {
    errors.borrow_id = 'Please select a borrow record'
  }

  const amount = Number(form.amount)
  if (!amount || amount < MIN_FINE_KHR) {
    errors.amount = `Amount must be at least ${MIN_FINE_KHR.toLocaleString('en-US')}៛`
  } else if (amount > MAX_FINE_KHR) {
    errors.amount = `Amount cannot exceed ${MAX_FINE_KHR.toLocaleString('en-US')}៛. Double-check you didn't add an extra digit.`
  }

  if (!form.reason) {
    errors.reason = 'Please select a reason'
  }

  return errors
}
