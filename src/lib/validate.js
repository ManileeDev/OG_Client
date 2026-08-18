// Mirrors the backend's rules (models.py): Indian mobile + standard email + person name
export const PHONE_RE = /^[6-9]\d{9}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Letters with spaces, dots, apostrophes, hyphens (e.g. "A. R. O'Brien-Kumar"), 2–60 chars
export const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,59}$/

export const isValidPhone = (phone) => PHONE_RE.test(phone)

export const isValidName = (name) => NAME_RE.test(name.trim())

// Email is optional — empty is valid
export const isValidEmail = (email) => !email.trim() || EMAIL_RE.test(email.trim())

export function phoneError(phone) {
  if (!phone) return null
  if (phone.length < 10) return 'Mobile number must be 10 digits.'
  if (!PHONE_RE.test(phone)) return 'Indian mobile numbers start with 6, 7, 8 or 9.'
  return null
}

export function nameError(name) {
  const trimmed = name.trim()
  if (!trimmed) return null // required-ness is enforced at submit time
  if (/\d/.test(trimmed)) return "Names can't contain numbers."
  if (trimmed.length < 2) return 'Name must be at least 2 characters.'
  if (!NAME_RE.test(trimmed)) return "Only letters, spaces, and . ' - are allowed."
  return null
}

export function emailError(email) {
  if (isValidEmail(email)) return null
  return 'Enter a valid email address (e.g. name@example.com).'
}
