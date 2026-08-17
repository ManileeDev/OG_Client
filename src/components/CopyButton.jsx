import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export default function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // clipboard API unavailable (non-secure context) — textarea fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      ta.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={copy}
      className="rounded p-1 text-ink-dim transition-colors hover:bg-panel-2 hover:text-ink"
      aria-label={`Copy ${text}`}
      title={copied ? 'Copied!' : 'Copy code'}
    >
      {copied ? <Check size={13} className="text-success" /> : <Copy size={13} />}
    </button>
  )
}
