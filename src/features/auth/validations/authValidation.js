import i18n from '@/plugins/i18n'

// Each validator returns an error message, or '' when the value is valid.
// Messages follow the selected language (auth.validation.* in locales/en|km/auth.json).
const t = (key) => i18n.global.t(`auth.validation.${key}`)

export function validateEmail(email) {
  if (!email) return t('emailRequired')
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(email)) return t('emailInvalid')
  return ''
}

export function validatePassword(password) {
  if (!password) return t('passwordRequired')
  if (password.length < 8) return t('passwordMin')
  return ''
}

export function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation) return t('confirmRequired')
  if (password !== confirmation) return t('confirmMismatch')
  return ''
}

export function validateName(name) {
  if (!name) return t('nameRequired')
  if (name.length > 100) return t('nameTooLong')
  return ''
}

export function validateLoginForm(form) {
  return {
    email: validateEmail(form.email),
    password: form.password ? '' : t('passwordRequired'),
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

export function validateForgotPasswordForm(form) {
  return {
    email: validateEmail(form.email),
  }
}

// Email/token come from the reset-link URL, so only the passwords are validated
export function validateResetPasswordForm(form) {
  return {
    password: validatePassword(form.password),
    password_confirmation: validatePasswordConfirmation(form.password, form.password_confirmation),
  }
}

/** True if any field has an error message. */
export function hasErrors(errors) {
  return Object.values(errors).some((msg) => msg !== '')
}