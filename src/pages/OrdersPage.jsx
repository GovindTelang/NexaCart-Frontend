import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { api } from '../api/client'
import Loading from '../components/Loading'

export default function OrdersPage() {
  const location = useLocation()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const placedOrder = location.state?.placedOrder

  useEffect(() => {
    api.myOrders()
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="shell page-section">
      <div className="section-heading compact">
        <div><span className="eyebrow">Account</span><h2>My orders</h2></div>
        <Link className="button secondary" to="/">Back to shop</Link>
      </div>

      {placedOrder && <div className="alert success">Order #{placedOrder.id} placed successfully.</div>}
      {error && <div className="alert error">{error}</div>}
      {loading && <Loading label="Loading your orders..." />}

      {!loading && !orders.length && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your completed checkouts will appear here.</p>
          <Link className="button" to="/">Start shopping</Link>
        </div>
      )}

      <div className="order-stack">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-head">
              <div><span className="eyebrow">Order #{order.id}</span><h3>{new Date(order.orderDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</h3></div>
              <span className="status-pill">{order.status}</span>
            </div>
            <div className="order-items">
              {(order.orderItems || []).map((item, index) => (
                <div className="order-row" key={`${order.id}-${index}`}>
                  <span>{item.productName || item.name}</span>
                  <span>{item.quantity} × ₹{Number(item.productPrice).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="summary-total"><span>Total</span><strong>₹{Number(order.totalAmount).toLocaleString('en-IN')}</strong></div>
          </article>
        ))}
      </div>
    </main>
  )
}
