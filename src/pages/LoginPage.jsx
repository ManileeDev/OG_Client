import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { ApiError } from '../api/client'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Unable to sign in')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4 py-8">
      <section className="w-full max-w-sm rounded-xl border border-edge bg-panel p-7 shadow-2xl shadow-black/20">
        <div className="mb-8 flex items-center gap-3">
          <img src="/oglogo.jpg" alt="The OG Clothing" className="brand-logo h-24 w-24 rounded-[10%] object-contain" />
          <div>
            <h1 className="font-display text-xl font-semibold">OG Clothing</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-ink-dim">Menswear</p>
          </div>
        </div>
        <h2 className="text-lg font-semibold">Sign in</h2>
        <p className="mt-1 text-sm text-ink-dim">Use your staff account to continue.</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <label className="text-sm font-medium">
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required className="mt-1.5 w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 font-normal focus:border-accent focus:outline-none" />
          </label>
          <label className="text-sm font-medium">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className="mt-1.5 w-full rounded-lg border border-edge bg-panel-2 px-3 py-2.5 font-normal focus:border-accent focus:outline-none" />
          </label>
          {error && <p className="text-sm text-danger" role="alert">{error}</p>}
          <button type="submit" disabled={submitting} className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-btn-ink hover:opacity-90 disabled:opacity-40">
            <LogIn size={16} />
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </section>
      <div className="fixed bottom-5 right-5 z-10 rounded-lg border border-edge bg-panel shadow-lg shadow-black/20">
        <ThemeToggle />
      </div>
    </main>
  )
}