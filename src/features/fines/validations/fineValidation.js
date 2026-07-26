
const MAX_FINE_AMOUNT = 500

export function validateFineForm(form) {
  const errors = {}

  if (!form.borrow_id) {
    errors.borrow_id = 'Please select a borrow record'
  }
  if (!form.amount || form.amount <= 0) {
    errors.amount = 'Amount must be greater than 0'
  } else if (Number(form.amount) > MAX_FINE_AMOUNT) {
    errors.amount = `Amount cannot exceed $${MAX_FINE_AMOUNT}. Double-check you didn't add an extra digit.`
  }

  if (!form.reason) {
    errors.reason = 'Please select a reason'
  }

  return errors
}