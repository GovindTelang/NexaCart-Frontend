import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "../api/client";
import Loading from "../components/Loading";
import type { OrderDTO, Product, ProductPayload } from "../types/api";
import { getErrorMessage } from "../utils/errors";
import { formatDate, formatINR } from "../utils/format";

interface ProductFormState {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stockQuantity: string;
}

const emptyForm: ProductFormState = { name: "", description: "", price: "", imageUrl: "", category: "Electronics", stockQuantity: "0" };

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [productPage, orderList] = await Promise.all([
        api.products({ page: 0, size: 1000, sortBy: "id", direction: "asc" }),
        api.allOrders(),
      ]);
      setProducts(productPage.content || []);
      setTotalProducts(productPage.totalElements ?? productPage.content.length);
      setOrders(orderList || []);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "We couldn't load the admin console."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return products;
    return products.filter((product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query) || (product.description || "").toLowerCase().includes(query));
  }, [products, productSearch]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);
    const payload: ProductPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      imageUrl: form.imageUrl.trim(),
      category: form.category.trim(),
      stockQuantity: Number(form.stockQuantity),
    };
    if (!Number.isFinite(payload.price) || payload.price <= 0 || !Number.isInteger(payload.stockQuantity) || payload.stockQuantity < 0) {
      setError("Enter a valid price and a whole-number stock quantity.");
      setSaving(false);
      return;
    }
    try {
      if (editingId !== null) await api.updateProduct(editingId, payload);
      else await api.addProduct(payload);
      setMessage(editingId !== null ? "Product updated." : "Product created.");
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "We couldn't save the product."));
    } finally {
      setSaving(false);
    }
  };

  const edit = (product: Product) => {
    setEditingId(product.id);
    setForm({ name: product.name, description: product.description || "", price: String(product.price), imageUrl: product.imageUrl || "", category: product.category, stockQuantity: String(product.stockQuantity) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (id: number) => {
    if (!window.confirm("Delete this product? This action cannot be undone.")) return;
    setError("");
    setMessage("");
    try {
      await api.deleteProduct(id);
      setMessage("Product deleted.");
      await load();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "We couldn't delete the product."));
    }
  };

  if (loading) return <main className="shell page-section"><Loading label="Loading admin workspace…" /></main>;

  return (
    <main className="shell page-section inner-page admin-page">
      <div className="page-title-row admin-title-row"><div><span className="eyebrow">THE BACK OFFICE</span><h1>Catalog & orders<span className="title-period">.</span></h1><p>Small details, well managed. Keep your catalog in good shape.</p></div><div className="admin-stats"><div><span>Listed products</span><strong>{totalProducts}</strong></div><div><span>Orders received</span><strong>{orders.length}</strong></div></div></div>
      {error && <div className="alert error" role="alert">{error}</div>}
      {message && <div className="alert success" role="status">{message}</div>}
      <section className="admin-grid">
        <form className="panel stack-form admin-form" onSubmit={(event) => void submit(event)}>
          <div className="panel-heading"><span className="eyebrow">CATALOG MANAGEMENT</span><h2>{editingId !== null ? "Edit product" : "Add a product"}</h2><p>{editingId !== null ? "Update the details, then save your changes." : "Add a new item to the NexaCart collection."}</p></div>
          <label>Product name<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
          <label>Description<textarea rows={4} maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
          <div className="form-grid"><label>Price (₹)<input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label>Stock quantity<input required type="number" min="0" step="1" value={form.stockQuantity} onChange={(event) => setForm({ ...form, stockQuantity: event.target.value })} /></label></div>
          <div className="form-grid"><label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} /></label><label>Image URL<input value={form.imageUrl} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} placeholder="/images/products/..." /></label></div>
          <div className="form-actions"><button className="button" type="submit" disabled={saving}>{saving ? "Saving…" : editingId !== null ? "Save changes →" : "Create product →"}</button>{editingId !== null && <button type="button" className="button secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
        </form>
        <section className="panel inventory-panel">
          <div className="panel-heading"><span className="eyebrow">WHAT'S IN STORE</span><h2>Inventory <span className="inline-count">{filteredProducts.length}</span></h2><p>Search and update products from the live catalog.</p></div>
          <label className="admin-search"><span className="sr-only">Search inventory</span><input type="search" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Search by name, category…" /></label>
          <div className="admin-product-list">{filteredProducts.length ? filteredProducts.map((product) => (
            <div className="admin-product-row" key={product.id}>
              <img src={product.imageUrl || "/images/img4.png"} alt="" onError={(event) => { event.currentTarget.src = "/images/img4.png"; }} />
              <div className="admin-product-info"><strong>{product.name}</strong><span>{product.category} · {formatINR(Number(product.price))}</span><small>{product.stockQuantity} in stock</small></div>
              <div className="row-actions"><button className="text-button" onClick={() => edit(product)}>Edit</button><button className="text-button danger-text" onClick={() => void remove(product.id)}>Delete</button></div>
            </div>
          )) : <div className="muted inventory-empty">No products match that search.</div>}</div>
        </section>
      </section>
      <section className="panel orders-panel">
        <div className="panel-heading"><span className="eyebrow">RECENT ACTIVITY</span><h2>All orders <span className="inline-count">{orders.length}</span></h2><p>A quick view of orders placed through the store.</p></div>
        {orders.length ? <div className="admin-orders-table"><div className="admin-orders-head"><span>Order</span><span>Customer</span><span>Date</span><span>Status</span><span>Total</span></div>{orders.map((order) => <div className="admin-order-row" key={order.id}><strong>#{order.id}</strong><span>{order.email || order.userName || "Customer"}</span><span>{formatDate(order.orderDate)}</span><span><span className={`status-pill status-${order.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{order.status}</span></span><strong>{formatINR(Number(order.totalAmount))}</strong></div>)}</div> : <p className="muted">No orders have been placed yet.</p>}
      </section>
    </main>
  );
}
