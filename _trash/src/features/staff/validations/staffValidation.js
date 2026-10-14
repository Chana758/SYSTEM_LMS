export function validateStaffForm(form, isEdit = false) {
  const errors = {}

  if (!form.name) errors.name = 'Please enter a name.'

  if (!isEdit) {
    if (!form.email) errors.email = 'Please enter an email address.'
    if (!form.password) errors.password = 'Please enter a password.'
    if (form.password !== form.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match.'
    }
  }

  return errors
}