const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim()
const API_BASE = configuredBase || '/api'

export function getToken() {
  return localStorage.getItem('nexacart_token')
}

export function setToken(token) {
  localStorage.setItem('nexacart_token', token)
}

export function clearToken() {
  localStorage.removeItem('nexacart_token')
}

export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=')))
  } catch {
    return null
  }
}

export function getCurrentUser() {
  const token = getToken()
  if (!token) return null

  const payload = decodeJwt(token)
  if (!payload) return null

  if (payload.exp && Date.now() >= payload.exp * 1000) {
    clearToken()
    return null
  }

  return {
    email: payload.sub,
    role: payload.role,
    token,
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = new Headers(options.headers || {})

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  const raw = await response.text()
  let data = raw

  try {
    data = raw ? JSON.parse(raw) : null
  } catch {
    // Keep plain-text responses as strings.
  }

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && (data.error || data.message)) ||
      (typeof data === 'string' && data) ||
      `Request failed with status ${response.status}`
    throw new Error(message)
  }

  return data
}

export const api = {
  login: async (email, password) => {
    const result = await request('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    const token = typeof result === 'string' ? result.replace(/^"|"$/g, '') : result?.token
    if (!token) throw new Error('Login succeeded but no JWT was returned')
    setToken(token)
    return getCurrentUser()
  },

  register: (payload) => request('/users/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  products: ({ page = 0, size = 8, sortBy = 'id', direction = 'asc' } = {}) =>
    request(`/products?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}&direction=${direction}`),

  searchProducts: ({ keyword = '', category = '', page = 0, size = 8 } = {}) => {
    const params = new URLSearchParams({ page, size })
    if (keyword) params.set('keyword', keyword)
    if (category) params.set('category', category)
    return request(`/products/search?${params.toString()}`)
  },

  addProduct: (payload) => request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),

  updateProduct: (id, payload) => request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  }),

  deleteProduct: (id) => request(`/products/${id}`, {
    method: 'DELETE',
  }),

  getCart: () => request('/cart'),

  addToCart: (productId, quantity = 1) => request(`/cart/add?productId=${productId}&quantity=${quantity}`, {
    method: 'POST',
  }),

  updateCartQuantity: (productId, quantity) => request(`/cart/update?productId=${productId}&quantity=${quantity}`, {
    method: 'PUT',
  }),

  removeFromCart: (productId) => request(`/cart/remove?productId=${productId}`, {
    method: 'DELETE',
  }),

  checkout: () => request('/orders/checkout', { method: 'POST' }),

  createPaymentOrder: () =>
    request('/payments/create-order', {
      method: 'POST',
    }),

  verifyPayment: ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  }) =>
    request(
      `/payments/verify?razorpayOrderId=${encodeURIComponent(razorpayOrderId)}&razorpayPaymentId=${encodeURIComponent(razorpayPaymentId)}&razorpaySignature=${encodeURIComponent(razorpaySignature)}`,
      {
        method: 'POST',
      }
    ),

  myOrders: () => request('/orders/my-orders'),

  allOrders: () => request('/orders/all-orders'),
}
