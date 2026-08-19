import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ErrorState from '../components/ErrorState'

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-6xl items-center justify-center pt-16">
      <ErrorState
        status={404}
        className="w-full max-w-xl border-none bg-transparent"
        action={
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-btn-ink hover:opacity-90"
          >
            <ArrowLeft size={15} /> Back to Billing
          </Link>
        }
      />
    </div>
  )
}
