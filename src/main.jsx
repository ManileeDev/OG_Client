import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

// Scrolling over a focused number input silently changes its value (and the
// spin buttons are hidden in index.css, so there's no visual cue). Blur the
// field on wheel so scrolling only ever scrolls the page.
document.addEventListener(
  'wheel',
  () => {
    const el = document.activeElement
    if (el instanceof HTMLInputElement && el.type === 'number') el.blur()
  },
  { passive: true },
)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60_000, // serve from cache for 1 min — page switches render instantly
      gcTime: 5 * 60_000, // keep unused query data cached for 5 min
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)
