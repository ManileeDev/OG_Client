// Mirrors the backend's rules (models.py): Indian mobile + standard email
export const PHONE_RE = /^[6-9]\d{9}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const isValidPhone = (phone) => PHONE_RE.test(phone)

// Email is optional — empty is valid
export const isValidEmail = (email) => !email.trim() || EMAIL_RE.test(email.trim())

export function phoneError(phone) {
  if (!phone) return null
  if (phone.length < 10) return 'Mobile number must be 10 digits.'
  if (!PHONE_RE.test(phone)) return 'Indian mobile numbers start with 6, 7, 8 or 9.'
  return null
}

export function emailError(email) {
  if (isValidEmail(email)) return null
  return 'Enter a valid email address (e.g. name@example.com).'
}
