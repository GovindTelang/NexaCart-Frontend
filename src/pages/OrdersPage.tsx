import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api/client";
import Loading from "../components/Loading";
import type { OrderDTO } from "../types/api";
import { getErrorMessage } from "../utils/errors";
import { formatDate, formatINR } from "../utils/format";

interface OrdersLocationState { placedOrder?: OrderDTO }

export default function OrdersPage() {
  const location = useLocation();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const state = location.state as OrdersLocationState | null;
  const placedOrder = state?.placedOrder;

  useEffect(() => {
    let active = true;
    api.myOrders()
      .then((result) => { if (active) setOrders(result); })
      .catch((error: unknown) => { if (active) setError(getErrorMessage(error, "We couldn't load your orders.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <main className="shell page-section inner-page">
      <div className="page-title-row"><div><span className="eyebrow">YOUR NEXACART</span><h1>Order history<span className="title-period">.</span></h1><p>One place for the things you've checked out with.</p></div><Link className="text-link" to="/">← Back to shop</Link></div>
      {placedOrder && <div className="alert success" role="status"><strong>Order #{placedOrder.id} placed.</strong><span>Thanks for shopping with NexaCart.</span></div>}
      {error && <div className="alert error" role="alert">{error}</div>}
      {loading && <Loading label="Gathering your orders…" />}
      {!loading && !orders.length && !error && <div className="empty-state"><div className="empty-symbol">↗</div><h2>Your next order starts here.</h2><p>Your completed purchases will show up here, ready whenever you need them.</p><Link className="button" to="/">Find something good <span aria-hidden="true">↗</span></Link></div>}
      {!loading && orders.length > 0 && <div className="order-stack">{orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div className="order-head"><div><span className="eyebrow">ORDER #{order.id}</span><h2>{formatDate(order.orderDate)}</h2><span className="order-item-count">{order.orderItems?.reduce((total, item) => total + item.quantity, 0) ?? 0} items</span></div><span className={`status-pill status-${order.status.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>{order.status}</span></div>
          <div className="order-items">{(order.orderItems || []).map((item, index) => <div className="order-row" key={`${order.id}-${index}`}><span>{item.productName}</span><span>{item.quantity} × {formatINR(Number(item.productPrice))}</span></div>)}</div>
          <div className="summary-total"><span>Order total</span><strong>{formatINR(Number(order.totalAmount))}</strong></div>
        </article>
      ))}</div>}
    </main>
  );
}
