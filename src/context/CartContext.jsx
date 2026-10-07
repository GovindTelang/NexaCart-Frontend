import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(false)

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }

    setLoading(true)
    try {
      setCart(await api.getCart())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshCart().catch(() => setCart(null))
  }, [isAuthenticated])

  const items = cart?.items || []
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + Number(item.product?.price || 0) * item.quantity, 0)

  const value = useMemo(() => ({
    cart,
    items,
    itemCount,
    total,
    loading,
    refreshCart,
  }), [cart, itemCount, total, loading])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}
