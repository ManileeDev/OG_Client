import { useState } from 'react'
import { Banknote, CreditCard, Smartphone, FileText } from 'lucide-react'
import Modal from '../../components/Modal'
import { formatINR } from '../../lib/format'

const MODES = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
]

const QUICK_NOTES = [500, 1000, 2000, 5000]

const REFERENCE_LABEL = {
  upi: 'UPI transaction ID (optional)',
  card: 'Card approval code / last 4 digits (optional)',
}

export default function PaymentModal({ total, onConfirm, onClose, busy, error }) {
  const [mode, setMode] = useState('cash')
  const [tendered, setTendered] = useState('')
  const [reference, setReference] = useState('')

  const tenderedNum = Number(tendered || 0)
  const change = Math.round((tenderedNum - total) * 100) / 100
  const canConfirm = mode === 'cash' ? tendered !== '' && tenderedNum >= total : true

  const confirm = () => {
    onConfirm({
      mode,
      amountTendered: mode === 'cash' ? tenderedNum : null,
      reference: mode === 'cash' ? null : reference.trim() || null,
    })
  }

  return (
    <Modal title="Payment" onClose={busy ? () => {} : onClose}>
      <div className="rounded-xl border border-edge bg-panel-2 px-4 py-3 text-center">
        <div className="text-xs uppercase tracking-[0.15em] text-ink-dim">Amount Due</div>
        <div className="mt-1 font-mono text-3xl font-bold text-primary">{formatINR(total)}</div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 text-xs font-medium text-ink-dim">Mode of Payment</div>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={[
                'flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm font-medium transition-colors',
                mode === id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-edge text-ink-dim hover:border-accent/50 hover:text-ink',
              ].join(' ')}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'cash' ? (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-dim">Cash Received</label>
          <input
            type="number"
            min="0"
            inputMode="decimal"
            value={tendered}
            onChange={(e) => setTendered(e.target.value)}
            placeholder={`${total}`}
            autoFocus
            className="w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 font-mono text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setTendered(String(total))}
              className="rounded-lg border border-edge px-3 py-1.5 text-xs text-ink-dim hover:border-accent hover:text-accent"
            >
              Exact
            </button>
            {QUICK_NOTES.filter((n) => n >= total).map((n) => (
              <button
                key={n}
                onClick={() => setTendered(String(n))}
                className="rounded-lg border border-edge px-3 py-1.5 font-mono text-xs text-ink-dim hover:border-accent hover:text-accent"
              >
                ₹{n}
              </button>
            ))}
          </div>
          {tendered !== '' && (
            <p className={`mt-2 text-sm font-medium ${change < 0 ? 'text-danger' : 'text-success'}`}>
              {change < 0
                ? `${formatINR(-change)} short of the total.`
                : `Change to return: ${formatINR(change)}`}
            </p>
          )}
        </div>
      ) : (
        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-ink-dim">
            {REFERENCE_LABEL[mode]}
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            maxLength={64}
            placeholder={mode === 'upi' ? 'e.g. 425899001234' : 'e.g. 4523'}
            className="w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 font-mono text-sm placeholder:font-sans placeholder:text-ink-dim focus:border-accent focus:outline-none"
          />
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error.message}
        </div>
      )}

      <div className="mt-5 flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={busy}
          className="rounded-lg border border-edge px-4 py-2 text-sm text-ink-dim hover:bg-panel-2 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={confirm}
          disabled={!canConfirm || busy}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-btn-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileText size={16} />
          {busy ? 'Generating…' : 'Confirm & Generate Invoice'}
        </button>
      </div>
    </Modal>
  )
}
