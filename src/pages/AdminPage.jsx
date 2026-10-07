import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import Loading from '../components/Loading'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: 'Electronics',
  stockQuantity: 0,
}

export default function AdminPage() {
  const [products, setProducts] = useState([])
  const [totalProducts, setTotalProducts] = useState(0)
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [productSearch, setProductSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)

    try {
      const [productPage, orderList] = await Promise.all([
        api.products({
          page: 0,
          size: 1000,
          sortBy: 'id',
          direction: 'asc',
        }),
        api.allOrders(),
      ])

      setProducts(productPage.content || [])
      setTotalProducts(
        productPage.totalElements ?? productPage.content?.length ?? 0
      )

      setOrders(orderList || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()

    if (!query) {
      return products
    }

    return products.filter((product) =>
      product.name?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    )
  }, [products, productSearch])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        category: form.category,
        stockQuantity: Number(form.stockQuantity),
      }

      if (editingId) {
        await api.updateProduct(editingId, payload)
      } else {
        await api.addProduct(payload)
      }

      setForm(emptyForm)
      setEditingId(null)

      setMessage(
        editingId
          ? 'Product updated.'
          : 'Product created.'
      )

      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const edit = (product) => {
    setEditingId(product.id)

    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      imageUrl: product.imageUrl || '',
      category: product.category,
      stockQuantity: product.stockQuantity,
    })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) {
      return
    }

    setError('')
    setMessage('')

    try {
      await api.deleteProduct(id)
      setMessage('Product deleted.')
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <main className="shell page-section">
        <Loading label="Loading admin console..." />
      </main>
    )
  }

  return (
    <main className="shell page-section">

      <div className="admin-hero">
        <div>
          <span className="eyebrow">Admin console</span>
          <h1>Catalog & orders</h1>
          <p>
            Manage products and review every order using your
            admin-only endpoints.
          </p>
        </div>

        <div className="admin-stats">
          <div>
            <strong>{totalProducts}</strong>
            <span>Products</span>
          </div>

          <div>
            <strong>{orders.length}</strong>
            <span>Orders</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      {message && (
        <div className="alert success">
          {message}
        </div>
      )}

      <section className="admin-grid">

        <form className="panel stack-form" onSubmit={submit}>

          <div className="panel-heading">
            <span className="eyebrow">Catalog</span>
            <h2>
              {editingId ? 'Edit product' : 'Add product'}
            </h2>
          </div>

          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </label>

          <label>
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
            />
          </label>

          <div className="form-grid">

            <label>
              Price
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Stock
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.stockQuantity}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stockQuantity: e.target.value,
                  })
                }
              />
            </label>

          </div>

          <div className="form-grid">

            <label>
              Category
              <input
                required
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Image URL
              <input
                value={form.imageUrl}
                onChange={(e) =>
                  setForm({
                    ...form,
                    imageUrl: e.target.value,
                  })
                }
              />
            </label>

          </div>

          <div className="form-actions">

            <button className="button" type="submit">
              {editingId
                ? 'Save changes'
                : 'Create product'}
            </button>

            {editingId && (
              <button
                type="button"
                className="button secondary"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                }}
              >
                Cancel
              </button>
            )}

          </div>

        </form>

        <section className="panel">

          <div className="panel-heading">
            <span className="eyebrow">Inventory</span>
            <h2>Products</h2>
          </div>

          <div className="admin-search">
            <input
              type="text"
              value={productSearch}
              onChange={(event) =>
                setProductSearch(event.target.value)
              }
              placeholder="Search products..."
              aria-label="Search products"
            />
          </div>

          <div className="admin-product-list">

            {filteredProducts.length > 0 ? (

              filteredProducts.map((product) => (

                <div
                  className="admin-product-row"
                  key={product.id}
                >

                  <img
                    src={
                      product.imageUrl ||
                      '/images/img4.png'
                    }
                    alt=""
                  />

                  <div>
                    <strong>{product.name}</strong>

                    <span>
                      {product.category} · ₹
                      {Number(product.price).toLocaleString('en-IN')}
                      {' · '}
                      {product.stockQuantity} stock
                    </span>
                  </div>

                  <div className="row-actions">

                    <button
                      className="text-button"
                      onClick={() => edit(product)}
                    >
                      Edit
                    </button>

                    <button
                      className="text-button danger-text"
                      onClick={() => remove(product.id)}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))

            ) : (

              <div className="muted">
                No products match your search.
              </div>

            )}

          </div>

        </section>

      </section>

      <section className="panel orders-panel">

        <div className="panel-heading">
          <span className="eyebrow">Operations</span>
          <h2>All orders</h2>
        </div>

        {orders.length ? (

          orders.map((order) => (

            <div
              className="admin-order-row"
              key={order.id}
            >

              <div>
                <strong>
                  Order #{order.id}
                </strong>

                <span>
                  {order.email ||
                    order.userEmail ||
                    'Customer'}
                  {' · '}
                  {new Date(
                    order.orderDate
                  ).toLocaleDateString('en-IN')}
                </span>
              </div>

              <span className="status-pill">
                {order.status}
              </span>

              <strong>
                ₹
                {Number(
                  order.totalAmount
                ).toLocaleString('en-IN')}
              </strong>

            </div>

          ))

        ) : (

          <div className="muted">
            No orders yet.
          </div>

        )}

      </section>

    </main>
  )
}