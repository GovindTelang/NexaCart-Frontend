import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Product } from "../types/api";
import { getErrorMessage } from "../utils/errors";
import { formatINR } from "../utils/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const add = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (product.stockQuantity <= 0) return;

    setBusy(true);
    setMessage("");
    try {
      await api.addToCart(product.id, 1);
      await refreshCart();
      setMessage("Added to cart");
    } catch (error: unknown) {
      setMessage(getErrorMessage(error, "Could not add this item."));
    } finally {
      setBusy(false);
      window.setTimeout(() => setMessage(""), 2200);
    }
  };

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <img
          className="product-image"
          src={product.imageUrl || "/images/img4.png"}
          alt={product.name}
          loading="lazy"
          onError={(event) => { event.currentTarget.src = "/images/img4.png"; }}
        />
        {product.stockQuantity === 0 && <span className="stock-pill sold-out">Sold out</span>}
        {product.stockQuantity > 0 && product.stockQuantity < 5 && <span className="stock-pill">Only {product.stockQuantity} left</span>}
        <span className="image-corner-mark" aria-hidden="true">N</span>
      </div>
      <div className="product-card-body">
        <div className="product-category">{product.category}</div>
        <h3>{product.name}</h3>
        <p>{product.description || "A considered pick for your everyday."}</p>
        <div className="product-row">
          <span className="price">{formatINR(Number(product.price))}</span>
          <button className="add-button" onClick={add} disabled={busy || product.stockQuantity <= 0}>
            {busy ? "Adding…" : message || <><span>Add</span><span className="add-plus">+</span></>}
          </button>
        </div>
      </div>
    </article>
  );
}
