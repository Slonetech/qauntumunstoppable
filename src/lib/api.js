const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  let data = null
  const text = await res.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = { error: text }
    }
  }

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || `Request failed (${res.status})`)
    err.status = res.status
    err.code = data?.error
    err.details = data
    throw err
  }

  return data
}

export const api = {
  health: () => request('/api/health'),

  auth: {
    register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    logout: () => request('/api/auth/logout', { method: 'POST' }),
    me: () => request('/api/auth/me'),
    updateMe: (body) => request('/api/auth/me', { method: 'PATCH', body: JSON.stringify(body) }),
  },

  waitlist: {
    submit: (body) => request('/api/waitlist', { method: 'POST', body: JSON.stringify(body) }),
  },

  billing: {
    status: () => request('/api/billing/status'),
    checkoutSession: (packageId) =>
      request('/api/billing/checkout-session', {
        method: 'POST',
        body: JSON.stringify({ packageId }),
      }),
  },

  admin: {
    login: (password) =>
      request('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }),
    logout: () => request('/api/admin/logout', { method: 'POST' }),
    stats: () => request('/api/admin/stats'),
  },

  signals: {
    list: () => request('/api/signals'),
  },
}

export function clearLegacyStorage() {
  ;['asp_users', 'asp_current_user', 'asp_waitlist', 'asp_payments'].forEach(key =>
    localStorage.removeItem(key)
  )
}
