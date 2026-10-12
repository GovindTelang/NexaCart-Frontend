export type UserRole = "USER" | "ADMIN" | string;

export interface Product {
  id: number;
  version: number | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  category: string;
  stockQuantity: number;
}

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
}

/** Fields returned by Spring Data's Page<Product> response. */
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  role?: UserRole;
  token: string;
}

export interface JwtPayload {
  sub?: unknown;
  role?: unknown;
  exp?: unknown;
  [claim: string]: unknown;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

export interface CartResponse {
  id: number;
  user?: UserResponse;
  items: CartItem[];
}

export interface OrderItemDTO {
  productName: string;
  productPrice: number;
  quantity: number;
}

/** Mirrors the backend's OrderDTO. */
export interface OrderDTO {
  id: number;
  totalAmount: number;
  status: string;
  orderDate: string | number | null;
  userName?: string | null;
  email?: string | null;
  orderItems: OrderItemDTO[];
}

export interface PaymentOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
}

export interface VerifyPaymentPayload {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface ProductListParams {
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: "asc" | "desc";
}

export interface ProductSearchParams {
  keyword?: string;
  category?: string;
  page?: number;
  size?: number;
}
