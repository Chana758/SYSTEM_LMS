export function validateFineForm(form) {
  const errors = {}
  if (!form.borrow_id) errors.borrow_id = 'Please select a borrow record'
  if (!form.amount || form.amount <= 0) errors.amount = 'Amount must be greater than 0'
  if (!form.reason) errors.reason = 'Please select a reason'
  return errors
}