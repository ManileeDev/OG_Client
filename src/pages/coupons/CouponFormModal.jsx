import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost, apiPut } from '../../api/client'
import Modal from '../../components/Modal'

const FIELD =
  'w-full rounded-lg border border-edge bg-panel px-3 py-2.5 text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none'
const LABEL = 'mb-1.5 block text-xs font-medium text-ink-dim'

export default function CouponFormModal({ coupon, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    code: coupon?.code ?? '',
    type: coupon?.type ?? 'percent',
    value: coupon?.value ?? '',
    minPurchase: coupon?.minPurchase ?? 0,
    expiry: coupon?.expiry ? coupon.expiry.slice(0, 10) : '',
    usageLimit: coupon?.usageLimit ?? '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const mutation = useMutation({
    mutationFn: (body) => (coupon ? apiPut(`/coupons/${coupon.id}`, body) : apiPost('/coupons', body)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] })
      onClose()
    },
  })

  const submit = (e) => {
    e.preventDefault()
    mutation.mutate({
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minPurchase: Number(form.minPurchase || 0),
      expiry: form.expiry,
      usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
    })
  }

  return (
    <Modal title={coupon ? 'Edit coupon' : 'Create coupon'} onClose={onClose} wide>
      <form onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Code</label>
          <input required value={form.code} onChange={set('code')} className={`${FIELD} font-mono uppercase`} placeholder="WELCOME10" />
        </div>
        <div>
          <label className={LABEL}>Discount type</label>
          <select value={form.type} onChange={set('type')} className={FIELD}>
            <option value="percent">Percent (%) off</option>
            <option value="flat">Flat (₹) off</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>{form.type === 'percent' ? 'Percent off (%)' : 'Amount off (₹)'}</label>
          <input
            required
            type="number"
            min="0.01"
            max={form.type === 'percent' ? 100 : undefined}
            step="0.01"
            value={form.value}
            onChange={set('value')}
            className={FIELD}
            placeholder={form.type === 'percent' ? '10' : '500'}
          />
        </div>
        <div>
          <label className={LABEL}>Minimum purchase (₹)</label>
          <input type="number" min="0" step="0.01" value={form.minPurchase} onChange={set('minPurchase')} className={FIELD} placeholder="500" />
        </div>
        <div>
          <label className={LABEL}>Expiry date</label>
          <input required type="date" value={form.expiry} onChange={set('expiry')} className={FIELD} />
        </div>
        <div>
          <label className={LABEL}>Usage limit (blank = unlimited)</label>
          <input type="number" min="1" step="1" value={form.usageLimit} onChange={set('usageLimit')} className={FIELD} placeholder="100" />
        </div>

        {mutation.error && (
          <div className="sm:col-span-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {mutation.error.message}
          </div>
        )}

        <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg border border-edge px-4 py-2 text-sm text-ink-dim hover:bg-panel">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-50">
            {mutation.isPending ? 'Saving…' : coupon ? 'Save changes' : 'Create coupon'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
