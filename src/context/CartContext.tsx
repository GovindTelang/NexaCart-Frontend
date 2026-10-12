import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { api } from "../api/client";
import type { CartItem, CartResponse } from "../types/api";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: CartResponse | null;
  items: CartItem[];
  itemCount: number;
  total: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: PropsWithChildren) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setCart(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setCart(await api.getCart());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void refreshCart().catch(() => setCart(null));
  }, [refreshCart]);

  const items = cart?.items ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + Number(item.product?.price ?? 0) * item.quantity, 0);

  const value = useMemo<CartContextValue>(() => ({
    cart,
    items,
    itemCount,
    total,
    loading,
    refreshCart,
  }), [cart, items, itemCount, total, loading, refreshCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
