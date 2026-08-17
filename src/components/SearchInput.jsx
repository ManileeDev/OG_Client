import { Search } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-dim" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-edge bg-panel py-2.5 pl-9 pr-3 text-sm placeholder:text-ink-dim focus:border-accent focus:outline-none"
      />
    </div>
  )
}
