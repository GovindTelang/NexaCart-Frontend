import { useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth()
  const { refreshCart } = useCart()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const add = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setBusy(true)
    setMessage('')
    try {
      await api.addToCart(product.id, 1)
      await refreshCart()
      setMessage('Added')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
      setTimeout(() => setMessage(''), 1800)
    }
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.imageUrl || '/images/img4.png'}
          alt={product.name}
          onError={(event) => { event.currentTarget.src = '/images/img4.png' }}
        />
        {product.stockQuantity === 0 && <span className="stock-pill sold-out">Sold out</span>}
        {product.stockQuantity > 0 && product.stockQuantity < 5 && <span className="stock-pill">Only {product.stockQuantity} left</span>}
      </div>
      <div className="product-card-body">
        <div className="product-category">{product.category}</div>
        <h3>{product.name}</h3>
        <p>{product.description || 'A premium pick from the NexaCart catalog.'}</p>
        <div className="product-row">
          <span className="price">₹{Number(product.price).toLocaleString('en-IN')}</span>
          <button className="button" onClick={add} disabled={busy || product.stockQuantity <= 0}>
            {busy ? 'Adding...' : message || 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
