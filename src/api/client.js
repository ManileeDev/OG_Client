export const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status // HTTP status; 0 means the server was unreachable
  }
}

async function request(path, options = {}, canRefresh = true) {
  let res
  try {
    const token = localStorage.getItem('og-access-token')
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    }
    res = await fetch(`${API}/api${path}`, {
      ...options,
      headers,
    })
  } catch {
    throw new ApiError('Could not reach the server', 0)
  }
  if (res.status === 401 && canRefresh && !path.startsWith('/auth/')) {
    const refreshToken = localStorage.getItem('og-refresh-token')
    if (refreshToken) {
      try {
        const refreshed = await request(
          '/auth/refresh',
          { method: 'POST', body: JSON.stringify({ refreshToken }) },
          false,
        )
        localStorage.setItem('og-access-token', refreshed.accessToken)
        localStorage.setItem('og-refresh-token', refreshed.refreshToken)
        return request(path, options, false)
      } catch {
        localStorage.removeItem('og-access-token')
        localStorage.removeItem('og-refresh-token')
        window.dispatchEvent(new Event('auth:session-expired'))
      }
    } else {
      localStorage.removeItem('og-access-token')
      window.dispatchEvent(new Event('auth:session-expired'))
    }
  }
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') detail = body.detail
      else if (Array.isArray(body.detail)) detail = body.detail[0]?.msg ?? detail
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(detail, res.status)
  }
  if (res.status === 204) return null
  return res.json()
}

export const apiGet = (path) => request(path)
export const apiPost = (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
export const apiPut = (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) })
export const apiDelete = (path) => request(path, { method: 'DELETE' })
