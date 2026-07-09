export function validateEmail(email) {
  if (!email) return 'សូមបញ្ចូលអ៊ីមែល'
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(email)) return 'អ៊ីមែលមិនត្រឹមត្រូវ'
  return ''
}

export function validatePassword(password) {
  if (!password) return 'សូមបញ្ចូលពាក្យសម្ងាត់'
  if (password.length < 8) return 'ពាក្យសម្ងាត់ត្រូវមានយ៉ាងហោចណាស់ ៨ តួ'
  return ''
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return 'សូមបញ្ជាក់ពាក្យសម្ងាត់'
  if (password !== confirmation) return 'ការបញ្ជាក់ពាក្យសម្ងាត់មិនត្រូវគ្នា'
  return ''
}

export function validateName(name) {
  if (!name) return 'សូមបញ្ចូលឈ្មោះ'
  if (name.length > 100) return 'ឈ្មោះវែងពេក'
  return ''
}

export function validateLoginForm(form) {
  return {
    email: validateEmail(form.email),
    password: form.password ? '' : 'សូមបញ្ចូលពាក្យសម្ងាត់',
  }
}

export function validateRegisterForm(form) {
  return {
    name: validateName(form.name),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    password_confirmation: validatePasswordConfirmation(form.password, form.password_confirmation),
  }
}

export function hasErrors(errors) {
  return Object.values(errors).some((msg) => msg !== '')
}