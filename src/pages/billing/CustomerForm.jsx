import { useEffect, useRef, useState } from 'react'
import { UserCheck } from 'lucide-react'
import { apiGet } from '../../api/client'
import { emailError, nameError, phoneError } from '../../lib/validate'

const FIELD =
  'w-full rounded-lg border bg-panel-2 px-3 py-2.5 text-sm placeholder:text-ink-dim focus:outline-none disabled:cursor-not-allowed disabled:opacity-60'
const OK_BORDER = 'border-edge focus:border-accent'
const BAD_BORDER = 'border-danger/60 focus:border-danger'
const LABEL = 'mb-1.5 block text-xs font-medium text-ink-dim'

export default function CustomerForm({ customer, onChange }) {
  const [existing, setExisting] = useState(null) // matched customer record | null
  const [touched, setTouched] = useState({ phone: false, name: false, email: false })
  const lookedUp = useRef('')

  // Validate once the cashier leaves the field (or the value is long enough to judge)
  const phoneMsg = (touched.phone || customer.phone.length === 10) ? phoneError(customer.phone) : null
  const nameMsg = touched.name && !existing ? nameError(customer.name) : null
  const emailMsg = touched.email && !existing ? emailError(customer.email) : null

  useEffect(() => {
    if (customer.phone.length !== 10) {
      setExisting(null)
      lookedUp.current = ''
      return
    }
    if (lookedUp.current === customer.phone) return
    lookedUp.current = customer.phone
    let cancelled = false
    apiGet(`/customers/by-phone/${customer.phone}`)
      .then((match) => {
        if (cancelled) return
        setExisting(match)
        // Existing customer: lock the identity fields to the stored record
        onChange((c) => ({ ...c, name: match.name, email: match.email ?? '' }))
      })
      .catch(() => !cancelled && setExisting(null)) // 404 → new customer
    return () => {
      cancelled = true
    }
  }, [customer.phone, onChange])

  const setPhone = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
    onChange((c) => ({ ...c, phone: digits }))
  }

  return (
    <section className="rounded-xl border border-edge bg-panel">
      <div className="border-b border-edge px-5 py-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.15em] text-ink-dim">
          Customer Details
        </h2>
      </div>
      <div className="flex flex-col gap-4 p-5">
        <div>
          <label className={LABEL}>
            Mobile Number <span className="text-danger">*</span>
          </label>
          <input
            inputMode="numeric"
            value={customer.phone}
            onChange={setPhone}
            onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
            placeholder="10-digit mobile number"
            className={`${FIELD} ${phoneMsg ? BAD_BORDER : OK_BORDER}`}
          />
          <p className="mt-1.5 text-xs text-ink-dim">
            {phoneMsg ? (
              <span className="text-danger">{phoneMsg}</span>
            ) : existing ? (
              <span className="text-accent">
                Existing customer — details locked to their record.
              </span>
            ) : (
              "Existing number auto-fills the customer's details."
            )}
          </p>
        </div>
        <div>
          <label className={`${LABEL} flex items-center gap-2`}>
            <span>
              Full Name <span className="text-danger">*</span>
            </span>
            {existing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">
                <UserCheck size={11} />
                {existing.orders} visit{existing.orders === 1 ? '' : 's'}
              </span>
            )}
          </label>
          <input
            value={customer.name}
            onChange={(e) => onChange((c) => ({ ...c, name: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, name: true }))}
            placeholder="Customer name"
            disabled={!!existing}
            className={`${FIELD} ${nameMsg ? BAD_BORDER : OK_BORDER}`}
          />
          {nameMsg && <p className="mt-1.5 text-xs text-danger">{nameMsg}</p>}
        </div>
        <div>
          <label className={LABEL}>Email (optional)</label>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => onChange((c) => ({ ...c, email: e.target.value }))}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            placeholder="name@example.com"
            disabled={!!existing}
            className={`${FIELD} ${emailMsg ? BAD_BORDER : OK_BORDER}`}
          />
          {emailMsg && <p className="mt-1.5 text-xs text-danger">{emailMsg}</p>}
        </div>
      </div>
    </section>
  )
}
