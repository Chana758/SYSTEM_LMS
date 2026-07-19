export function validateMemberForm(form, isEdit = false) {
  const errors = {}

  if (!form.name) errors.name = 'Please enter a name.'

  if (!isEdit) {
    if (!form.email) errors.email = 'Please enter an email address.'
    if (!form.password) errors.password = 'Please enter a password.'
    if (form.password && form.password.length < 8) errors.password = 'Password must be at least 8 characters long.'
    if (form.password !== form.password_confirmation) errors.password_confirmation = 'Passwords do not match.'
  }

  if (!form.membership_type) errors.membership_type = 'Please select a membership type.'

  return errors
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}