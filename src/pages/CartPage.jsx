import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import Loading from '../components/Loading'
import { useCart } from '../context/CartContext'

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function CartPage() {
  const { items, total, loading, refreshCart } = useCart()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [checkoutBusy, setCheckoutBusy] = useState(false)

  const changeQuantity = async (productId, quantity) => {
    setBusyId(productId)
    setError('')
    try {
      if (quantity <= 0) await api.removeFromCart(productId)
      else await api.updateCartQuantity(productId, quantity)
      await refreshCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const checkout = async () => {
    setCheckoutBusy(true)
    setError('')

    try {
      const loaded = await loadRazorpayScript()

      if (!loaded) {
        throw new Error('Unable to load secure payment checkout')
      }

      const paymentOrder = await api.createPaymentOrder()

      const options = {
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'NexaCart',
        description: 'Secure NexaCart checkout',
        order_id: paymentOrder.orderId,

        prefill: {
          email: paymentOrder.customerEmail,
        },

        theme: {
          color: '#ff6600',
        },

        handler: async (response) => {
          try {
            const order = await api.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })

            await refreshCart()

            navigate('/orders', {
              state: { placedOrder: order },
            })
          } catch (err) {
            setError(err.message)
            setCheckoutBusy(false)
          }
        },

        modal: {
          ondismiss: () => {
            setCheckoutBusy(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', (response) => {
        setError(
          response.error?.description ||
          'Payment failed. Please try again.'
        )
        setCheckoutBusy(false)
      })

      razorpay.open()

    } catch (err) {
      setError(err.message)
      setCheckoutBusy(false)
    }
  }

  if (loading) return <main className="shell page-section"><Loading label="Loading your cart..." /></main>

  return (
    <main className="shell page-section">
      <div className="section-heading compact">
        <div><span className="eyebrow">Your basket</span><h2>Shopping cart</h2></div>
        <Link className="button secondary" to="/">Continue shopping</Link>
      </div>

      {error && <div className="alert error">{error}</div>}

      {!items.length ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add something you like from the catalog and it will appear here.</p>
          <Link className="button" to="/">Browse products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            {items.map((item) => (
              <article className="cart-item" key={item.id || item.product.id}>
                <img src={item.product.imageUrl || '/images/img4.png'} alt={item.product.name} />
                <div className="cart-item-main">
                  <span className="product-category">{item.product.category}</span>
                  <h3>{item.product.name}</h3>
                  <span className="muted">₹{Number(item.product.price).toLocaleString('en-IN')} each</span>
                </div>
                <div className="quantity-control">
                  <button disabled={busyId === item.product.id} onClick={() => changeQuantity(item.product.id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button disabled={busyId === item.product.id} onClick={() => changeQuantity(item.product.id, item.quantity + 1)}>+</button>
                </div>
                <strong>₹{(Number(item.product.price) * item.quantity).toLocaleString('en-IN')}</strong>
                <button className="icon-button danger" onClick={() => changeQuantity(item.product.id, 0)} title="Remove">✕</button>
              </article>
            ))}
          </section>

          <aside className="summary-card">
            <span className="eyebrow">Order summary</span>
            <div className="summary-line"><span>Items</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="summary-line"><span>Subtotal</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            <div className="summary-line"><span>Shipping</span><span>Free</span></div>
            <div className="summary-total"><span>Total</span><strong>₹{total.toLocaleString('en-IN')}</strong></div>
            <button className="button full" onClick={checkout} disabled={checkoutBusy}>{checkoutBusy ? 'Placing order...' : 'Checkout'}</button>
            <p className="small-note">Checkout uses the current server-side product prices and validates stock before creating the order.</p>
          </aside>
        </div>
      )}
    </main>
  )
}
