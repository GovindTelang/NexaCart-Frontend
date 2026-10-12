import type {
  AuthUser,
  CartResponse,
  JwtPayload,
  OrderDTO,
  PageResponse,
  PaymentOrderResponse,
  Product,
  ProductListParams,
  ProductPayload,
  ProductSearchParams,
  RegisterPayload,
  UserResponse,
  VerifyPaymentPayload,
} from "../types/api";

const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE = configuredBase || "/api";

export function getToken(): string | null {
  return localStorage.getItem("nexacart_token");
}

export function setToken(token: string): void {
  localStorage.setItem("nexacart_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("nexacart_token");
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const parsed: unknown = JSON.parse(atob(padded));
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

export function getCurrentUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;

  const payload = decodeJwt(token);
  if (!payload || typeof payload.sub !== "string") {
    clearToken();
    return null;
  }

  if (typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) {
    clearToken();
    return null;
  }

  return {
    email: payload.sub,
    role: typeof payload.role === "string" ? payload.role : undefined,
    token,
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const raw = await response.text();
  let data: unknown = raw;

  try {
    data = raw ? JSON.parse(raw) as unknown : null;
  } catch {
    // Some endpoints intentionally return plain text; preserve that response.
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (typeof data === "string" && data.trim()) {
      message = data;
    } else if (typeof data === "object" && data !== null) {
      const errorBody = data as { error?: unknown; message?: unknown };
      if (typeof errorBody.error === "string") message = errorBody.error;
      else if (typeof errorBody.message === "string") message = errorBody.message;
    }
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  login: async (email: string, password: string): Promise<AuthUser | null> => {
    // The backend's /users/login endpoint returns the JWT as a JSON string.
    const result = await request<string>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = result.replace(/^"|"$/g, "").trim();
    if (!token) throw new Error("Login succeeded but no JWT was returned.");
    setToken(token);
    return getCurrentUser();
  },

  register: (payload: RegisterPayload) =>
    request<UserResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  products: ({ page = 0, size = 8, sortBy = "id", direction = "asc" }: ProductListParams = {}) =>
    request<PageResponse<Product>>(
      `/products?page=${page}&size=${size}&sortBy=${encodeURIComponent(sortBy)}&direction=${direction}`,
    ),

  searchProducts: ({ keyword = "", category = "", page = 0, size = 8 }: ProductSearchParams = {}) => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (keyword) params.set("keyword", keyword);
    if (category) params.set("category", category);
    return request<PageResponse<Product>>(`/products/search?${params.toString()}`);
  },

  addProduct: (payload: ProductPayload) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(payload) }),

  updateProduct: (id: number, payload: ProductPayload) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),

  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),

  getCart: () => request<CartResponse>("/cart"),

  addToCart: (productId: number, quantity = 1) =>
    request<CartResponse>(`/cart/add?productId=${productId}&quantity=${quantity}`, { method: "POST" }),

  updateCartQuantity: (productId: number, quantity: number) =>
    request<CartResponse>(`/cart/update?productId=${productId}&quantity=${quantity}`, { method: "PUT" }),

  removeFromCart: (productId: number) =>
    request<void>(`/cart/remove?productId=${productId}`, { method: "DELETE" }),

  // Kept to preserve the existing backend API surface; the current checkout uses Razorpay below.
  checkout: () => request<OrderDTO>("/orders/checkout", { method: "POST" }),

  createPaymentOrder: () =>
    request<PaymentOrderResponse>("/payments/create-order", { method: "POST" }),

  verifyPayment: (payload: VerifyPaymentPayload) =>
    request<OrderDTO>(
      `/payments/verify?razorpayOrderId=${encodeURIComponent(payload.razorpayOrderId)}&razorpayPaymentId=${encodeURIComponent(payload.razorpayPaymentId)}&razorpaySignature=${encodeURIComponent(payload.razorpaySignature)}`,
      { method: "POST" },
    ),

  myOrders: () => request<OrderDTO[]>("/orders/my-orders"),
  allOrders: () => request<OrderDTO[]>("/orders/all-orders"),
};
