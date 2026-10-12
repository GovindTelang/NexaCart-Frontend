import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import Loading from "../components/Loading";
import { useCart } from "../context/CartContext";
import { getErrorMessage } from "../utils/errors";
import { formatINR } from "../utils/format";

function loadRazorpayScript(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay="true"]');
  if (existing) {
    return new Promise((resolve) => {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
    });
  }
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.dataset.razorpay = "true";
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartPage() {
  const { items, total, loading, refreshCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const changeQuantity = async (productId: number, quantity: number) => {
    setBusyId(productId);
    setError("");
    try {
      if (quantity <= 0) await api.removeFromCart(productId);
      else await api.updateCartQuantity(productId, quantity);
      await refreshCart();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "We couldn't update your cart."));
    } finally {
      setBusyId(null);
    }
  };

  const checkout = async () => {
    setCheckoutBusy(true);
    setError("");
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) throw new Error("Unable to load secure payment checkout. Please try again.");

      const paymentOrder = await api.createPaymentOrder();
      const razorpay = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "NexaCart",
        description: "Secure NexaCart checkout",
        order_id: paymentOrder.orderId,
        prefill: { email: paymentOrder.customerEmail },
        theme: { color: "#d65a2f" },
        handler: async (response) => {
          try {
            const order = await api.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            await refreshCart();
            navigate("/orders", { state: { placedOrder: order } });
          } catch (error: unknown) {
            setError(getErrorMessage(error, "Payment was received but order verification failed. Please contact support."));
            setCheckoutBusy(false);
          }
        },
        modal: { ondismiss: () => setCheckoutBusy(false) },
      });
      razorpay.on("payment.failed", (response) => {
        setError(response.error?.description || "Payment failed. Please try again.");
        setCheckoutBusy(false);
      });
      razorpay.open();
    } catch (error: unknown) {
      setError(getErrorMessage(error, "We couldn't start checkout."));
      setCheckoutBusy(false);
    }
  };

  if (loading) return <main className="shell page-section"><Loading label="Loading your basket…" /></main>;

  return (
    <main className="shell page-section inner-page">
      <div className="page-title-row"><div><span className="eyebrow">YOUR BASKET</span><h1>Shopping cart<span className="title-period">.</span></h1><p>Everything you've picked, all in one place.</p></div><Link className="text-link" to="/">← Keep browsing</Link></div>
      {error && <div className="alert error" role="alert">{error}</div>}
      {!items.length ? (
        <div className="empty-state cart-empty"><div className="empty-symbol">＋</div><h2>Your basket is taking a breather.</h2><p>When you find something you like, add it here and it'll be waiting for you.</p><Link className="button" to="/">Explore the store <span aria-hidden="true">↗</span></Link></div>
      ) : (
        <div className="cart-layout">
          <section className="cart-list" aria-label="Items in your cart">
            <div className="cart-list-heading"><span>{items.reduce((sum, item) => sum + item.quantity, 0)} items</span><span>Item details</span><span>Quantity</span><span>Total</span></div>
            {items.map((item) => (
              <article className="cart-item" key={item.id || item.product.id}>
                <img src={item.product.imageUrl || "/images/img4.png"} alt={item.product.name} onError={(event) => { event.currentTarget.src = "/images/img4.png"; }} />
                <div className="cart-item-main"><span className="product-category">{item.product.category}</span><h3>{item.product.name}</h3><span className="muted">{formatINR(Number(item.product.price))} each</span><button className="remove-link" onClick={() => void changeQuantity(item.product.id, 0)} disabled={busyId === item.product.id}>Remove</button></div>
                <div className="quantity-control" aria-label={`Quantity for ${item.product.name}`}><button aria-label="Decrease quantity" disabled={busyId === item.product.id} onClick={() => void changeQuantity(item.product.id, item.quantity - 1)}>−</button><span>{item.quantity}</span><button aria-label="Increase quantity" disabled={busyId === item.product.id} onClick={() => void changeQuantity(item.product.id, item.quantity + 1)}>+</button></div>
                <strong className="cart-item-total">{formatINR(Number(item.product.price) * item.quantity)}</strong>
              </article>
            ))}
          </section>
          <aside className="summary-card">
            <span className="eyebrow">THE DETAILS</span><h2>Order summary</h2>
            <div className="summary-line"><span>Items</span><span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="summary-line"><span>Subtotal</span><span>{formatINR(total)}</span></div>
            <div className="summary-line"><span>Shipping</span><span className="free-label">On us</span></div>
            <div className="summary-total"><span>Total</span><strong>{formatINR(total)}</strong></div>
            <button className="button full checkout-button" onClick={() => void checkout()} disabled={checkoutBusy}>{checkoutBusy ? "Preparing checkout…" : "Continue to payment"}<span aria-hidden="true">→</span></button>
            <div className="secure-note"><span>◇</span><span>Secure payment powered by Razorpay. Final prices and stock are validated by the server.</span></div>
          </aside>
        </div>
      )}
    </main>
  );
}
